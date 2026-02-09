import List "mo:core/List";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
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
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public type ResponseStatus = {
    #NoResponse;
    #ActiveDiscussion;
    #LeadsGenerated;
    #NegativeFeedback;
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
    createdAt : Nat;
    updatedAt : Nat;
    attachment : ?Storage.ExternalBlob;
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

  // Entries CRUD - Allow all users including anonymous (guests)
  public shared ({ caller }) func createEntry(
    groupName : Text,
    groupUrl : Text,
    datePosted : Text,
    postContent : Text,
    numReactions : Nat,
    numComments : Nat,
    responseStatus : ResponseStatus,
    followUpDate : Text,
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
      createdAt = Time.now().toNat();
      updatedAt = Time.now().toNat();
      attachment;
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
          createdAt = existing.createdAt;
          updatedAt = Time.now().toNat();
          attachment;
        };
        entries.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteEntry(id : Nat) : async () {
    entries.remove(id);
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

  // Follow-up queries - Allow all users including anonymous (guests)
  public query ({ caller }) func getFollowUpToday(today : Text) : async [FacebookOutreachEntry] {
    let matching = entries.values().filter(
      func(entry) {
        entry.followUpDate == today;
      }
    );
    matching.toArray();
  };

  // Group summary - Allow all users including anonymous (guests)
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

  // Group Notes CRUD - Allow all users including anonymous (guests)
  public shared ({ caller }) func setGroupNotes(groupUrl : Text, notes : Text) : async () {
    groupNotes.add(groupUrl, notes);
  };

  public query ({ caller }) func getGroupNotes(groupUrl : Text) : async ?Text {
    groupNotes.get(groupUrl);
  };

  public query ({ caller }) func listAllGroupNotes() : async [(Text, Text)] {
    let notesArray = groupNotes.toArray();
    notesArray;
  };

  // Hook Template Library - Allow all users including anonymous (guests)
  public type HookTemplate = {
    title : Text;
    content : Text;
  };

  let hookTemplates = Map.empty<Principal, [HookTemplate]>();

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
};
