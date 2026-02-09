import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type UserProfile = {
    name : Text;
  };

  type CraftCategory = {
    #SplatterRoom;
    #CandleMaking;
    #SoapMaking;
  };

  type TypeOfInterest = {
    #Price;
    #Availability;
    #GroupBooking;
  };

  type ResponseStatus = {
    #NoResponse;
    #ActiveDiscussion;
    #LeadsGenerated;
    #NegativeFeedback;
  };

  public type EventType = {
    #GeneralDIYIndividual;
    #BirthdayPartyKids;
    #BirthdayPartyAdult;
    #BacheloretteBridalShower;
    #GirlsNightOut;
    #FieldTrips;
    #CorporateTeamBuilding;
  };

  public type FacebookOutreachEntry = {
    id : Nat;
    groupName : Text;
    groupUrl : Text;
    datePosted : Text;
    postContent : Text;
    numReactions : Nat;
    numComments : Nat;
    responseStatus : ResponseStatus;
    followUpDate : Text;
    craftCategory : CraftCategory;
    typeOfInterest : TypeOfInterest;
    eventType : EventType;
    leadContactInfo : Text;
    createdAt : Nat;
    updatedAt : Nat;
    attachment : ?Storage.ExternalBlob;
    owner : Principal;
  };

  module FacebookOutreachEntry {
    public func compareByCreatedAt(a : FacebookOutreachEntry, b : FacebookOutreachEntry) : Order.Order {
      Nat.compare(b.createdAt, a.createdAt);
    };

    public func compareByGroupName(a : FacebookOutreachEntry, b : FacebookOutreachEntry) : Order.Order {
      Text.compare(a.groupName, b.groupName);
    };
  };

  let entries = Map.empty<Nat, FacebookOutreachEntry>();
  let groupNotes = Map.empty<Text, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextId = 0;

  let hookTemplates = Map.empty<Principal, [HookTemplate]>();

  // --- User Profile Methods (require authentication) ---
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- Facebook Outreach Entry CRUD (anonymous access allowed) ---
  public shared ({ caller }) func createEntry(
    groupName : Text,
    groupUrl : Text,
    datePosted : Text,
    postContent : Text,
    numReactions : Nat,
    numComments : Nat,
    responseStatus : ResponseStatus,
    followUpDate : Text,
    craftCategory : CraftCategory,
    typeOfInterest : TypeOfInterest,
    eventType : EventType,
    leadContactInfo : Text,
    attachment : ?Storage.ExternalBlob,
  ) : async FacebookOutreachEntry {
    let id = nextId;
    nextId += 1;

    let entry : FacebookOutreachEntry = {
      id;
      groupName;
      groupUrl;
      datePosted;
      postContent;
      numReactions;
      numComments;
      responseStatus;
      followUpDate;
      craftCategory;
      typeOfInterest;
      eventType;
      leadContactInfo;
      createdAt = Time.now().toNat();
      updatedAt = Time.now().toNat();
      attachment;
      owner = caller;
    };

    entries.add(id, entry);
    entry;
  };

  public shared ({ caller }) func updateEntry(
    id : Nat,
    groupName : Text,
    groupUrl : Text,
    datePosted : Text,
    postContent : Text,
    numReactions : Nat,
    numComments : Nat,
    responseStatus : ResponseStatus,
    followUpDate : Text,
    craftCategory : CraftCategory,
    typeOfInterest : TypeOfInterest,
    eventType : EventType,
    leadContactInfo : Text,
    attachment : ?Storage.ExternalBlob,
  ) : async FacebookOutreachEntry {
    switch (entries.get(id)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?existing) {
        let updated : FacebookOutreachEntry = {
          id;
          groupName;
          groupUrl;
          datePosted;
          postContent;
          numReactions;
          numComments;
          responseStatus;
          followUpDate;
          craftCategory;
          typeOfInterest;
          eventType;
          leadContactInfo;
          createdAt = existing.createdAt;
          updatedAt = Time.now().toNat();
          attachment;
          owner = existing.owner;
        };
        entries.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteEntry(id : Nat) : async () {
    switch (entries.get(id)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?existing) {
        entries.remove(id);
      };
    };
  };

  public query ({ caller }) func getEntry(id : Nat) : async FacebookOutreachEntry {
    switch (entries.get(id)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func listEntries(page : Nat, pageSize : Nat) : async [FacebookOutreachEntry] {
    let allEntries = entries.values().toArray().sort(FacebookOutreachEntry.compareByCreatedAt);
    let start = page * pageSize;
    let end = Nat.min(start + pageSize, allEntries.size());
    if (start >= allEntries.size()) {
      return [];
    };
    allEntries.sliceToArray(start, end);
  };

  // --- Facebook Outreach Queries (anonymous access allowed) ---
  public query ({ caller }) func getFollowUpToday(today : Text) : async [FacebookOutreachEntry] {
    let matching = entries.values().filter(
      func(entry) {
        entry.followUpDate == today;
      }
    );
    matching.toArray();
  };

  public query ({ caller }) func getGroupResponseSummary() : async [(Text, Nat)] {
    let groupCounts = Map.empty<Text, Nat>();

    for ((_, entry) in entries.entries()) {
      if (entry.responseStatus == #ActiveDiscussion or entry.responseStatus == #LeadsGenerated) {
        let current = switch (groupCounts.get(entry.groupName)) {
          case (null) { 0 };
          case (?count) { count };
        };
        groupCounts.add(entry.groupName, current + 1);
      };
    };

    let resultList = List.empty<(Text, Nat)>();

    for ((groupName, count) in groupCounts.entries()) {
      resultList.add((groupName, count));
    };

    resultList.toArray();
  };

  public type InquirySummary = {
    generalDIY : Nat;
    birthdayPartyKids : Nat;
    birthdayPartyAdult : Nat;
    bacheloretteBridalShower : Nat;
    girlsNightOut : Nat;
    fieldTrips : Nat;
    corporateTeamBuilding : Nat;
  };

  public query ({ caller }) func getInquirySummaryByEventType() : async InquirySummary {
    var generalDIY = 0;
    var birthdayPartyKids = 0;
    var birthdayPartyAdult = 0;
    var bacheloretteBridalShower = 0;
    var girlsNightOut = 0;
    var fieldTrips = 0;
    var corporateTeamBuilding = 0;

    for ((_, entry) in entries.entries()) {
      if (entry.typeOfInterest == #GroupBooking) {
        switch (entry.eventType) {
          case (#GeneralDIYIndividual) { generalDIY += 1 };
          case (#BirthdayPartyKids) { birthdayPartyKids += 1 };
          case (#BirthdayPartyAdult) { birthdayPartyAdult += 1 };
          case (#BacheloretteBridalShower) { bacheloretteBridalShower += 1 };
          case (#GirlsNightOut) { girlsNightOut += 1 };
          case (#FieldTrips) { fieldTrips += 1 };
          case (#CorporateTeamBuilding) { corporateTeamBuilding += 1 };
        };
      };
    };

    {
      generalDIY;
      birthdayPartyKids;
      birthdayPartyAdult;
      bacheloretteBridalShower;
      girlsNightOut;
      fieldTrips;
      corporateTeamBuilding;
    };
  };

  // --- Notes System (anonymous access allowed) ---
  public shared ({ caller }) func setGroupNotes(groupUrl : Text, notes : Text) : async () {
    groupNotes.add(groupUrl, notes);
  };

  public query ({ caller }) func getGroupNotes(groupUrl : Text) : async ?Text {
    groupNotes.get(groupUrl);
  };

  public query ({ caller }) func listAllGroupNotes() : async [(Text, Text)] {
    groupNotes.toArray();
  };

  // --- Hook Templates (anonymous access allowed) ---
  public type HookTemplate = {
    title : Text;
    content : Text;
  };

  public shared ({ caller }) func saveHookTemplates(templates : [HookTemplate]) : async () {
    if (templates.size() != 3) {
      Runtime.trap("You must provide exactly 3 hook templates");
    };

    hookTemplates.add(caller, templates);
  };

  public query ({ caller }) func getHookTemplatesForCaller() : async [HookTemplate] {
    switch (hookTemplates.get(caller)) {
      case (null) {
        let defaultTemplate = {
          title = "";
          content = "";
        };
        [defaultTemplate, defaultTemplate, defaultTemplate];
      };
      case (?templates) { templates };
    };
  };

  // --- Health Endpoint ---
  public query ({ caller }) func health() : async Bool { true };
};
