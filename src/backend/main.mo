import List "mo:core/List";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

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

  // New types for Craft Category and Type of Interest
  public type CraftCategory = {
    #SplatterRoom;
    #CandleMaking;
    #SoapMaking;
  };

  public type TypeOfInterest = {
    #Price;
    #Availability;
    #GroupBooking;
  };

  public type ResponseStatus = {
    #NoResponse;
    #ActiveDiscussion;
    #LeadsGenerated;
    #NegativeFeedback;
  };

  // Updated outreach entry with new fields and owner tracking
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
  var nextId = 0;

  // Entries CRUD - Require user authentication
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
    attachment : ?Storage.ExternalBlob,
  ) : async FacebookOutreachEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create entries");
    };

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
    attachment : ?Storage.ExternalBlob,
  ) : async FacebookOutreachEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update entries");
    };

    switch (entries.get(id)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?existing) {
        // Only owner or admin can update
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the entry owner or admin can update this entry");
        };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete entries");
    };

    switch (entries.get(id)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?existing) {
        // Only owner or admin can delete
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the entry owner or admin can delete this entry");
        };
        entries.remove(id);
      };
    };
  };

  public query ({ caller }) func getEntry(id : Nat) : async FacebookOutreachEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view entries");
    };

    switch (entries.get(id)) {
      case (null) { Runtime.trap("Entry not found") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func listEntries(page : Nat, pageSize : Nat) : async [FacebookOutreachEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list entries");
    };

    let allEntries = entries.values().toArray().sort(FacebookOutreachEntry.compareByCreatedAt);
    let start = page * pageSize;
    let end = Nat.min(start + pageSize, allEntries.size());
    if (start >= allEntries.size()) {
      return [];
    };
    allEntries.sliceToArray(start, end);
  };

  // Follow-up queries - Require user authentication
  public query ({ caller }) func getFollowUpToday(today : Text) : async [FacebookOutreachEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view follow-ups");
    };

    let matching = entries.values().filter(
      func(entry) {
        entry.followUpDate == today;
      }
    );
    matching.toArray();
  };

  // Group summary - Require user authentication
  public query ({ caller }) func getGroupResponseSummary() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view group summaries");
    };

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

  // Group Notes CRUD - Require user authentication for modifications
  public shared ({ caller }) func setGroupNotes(groupUrl : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set group notes");
    };
    groupNotes.add(groupUrl, notes);
  };

  public query ({ caller }) func getGroupNotes(groupUrl : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view group notes");
    };
    groupNotes.get(groupUrl);
  };

  public query ({ caller }) func listAllGroupNotes() : async [(Text, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list group notes");
    };
    let notesArray = groupNotes.toArray();
    notesArray;
  };

  // Hook Template Library - Require user authentication
  public type HookTemplate = {
    title : Text;
    content : Text;
  };

  let hookTemplates = Map.empty<Principal, [HookTemplate]>();

  public shared ({ caller }) func saveHookTemplates(templates : [HookTemplate]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save hook templates");
    };

    if (templates.size() != 3) {
      Runtime.trap("You must provide exactly 3 hook templates");
    };

    hookTemplates.add(caller, templates);
  };

  public query ({ caller }) func getHookTemplatesForCaller() : async [HookTemplate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hook templates");
    };

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

  // Health check endpoint - Always available
  public query ({ caller }) func health() : async Bool {
    true;
  };
};
