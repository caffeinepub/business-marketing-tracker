import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
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

  type EventType = {
    #GeneralDIYIndividual;
    #BirthdayPartyKids;
    #BirthdayPartyAdult;
    #BacheloretteBridalShower;
    #GirlsNightOut;
    #FieldTrips;
    #CorporateTeamBuilding;
  };

  type UserProfile = {
    name : Text;
  };

  type HookTemplate = {
    title : Text;
    content : Text;
  };

  // Old FacebookOutreachEntry without leadContactInfo
  type OldFacebookOutreachEntry = {
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
    createdAt : Nat;
    updatedAt : Nat;
    attachment : ?Storage.ExternalBlob;
    owner : Principal;
  };

  // Old actor without the new field
  type OldActor = {
    entries : Map.Map<Nat, OldFacebookOutreachEntry>;
    groupNotes : Map.Map<Text, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextId : Nat;
    hookTemplates : Map.Map<Principal, [HookTemplate]>;
  };

  // New FacebookOutreachEntry with leadContactInfo
  type NewFacebookOutreachEntry = {
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
    createdAt : Nat;
    updatedAt : Nat;
    attachment : ?Storage.ExternalBlob;
    owner : Principal;
    leadContactInfo : Text;
  };

  // New actor with the new field
  type NewActor = {
    entries : Map.Map<Nat, NewFacebookOutreachEntry>;
    groupNotes : Map.Map<Text, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextId : Nat;
    hookTemplates : Map.Map<Principal, [HookTemplate]>;
  };

  public func run(old : OldActor) : NewActor {
    let newEntries = old.entries.map<Nat, OldFacebookOutreachEntry, NewFacebookOutreachEntry>(
      func(_id, oldEntry) {
        {
          oldEntry with
          leadContactInfo = "";
        };
      }
    );
    {
      old with entries = newEntries;
    };
  };
};
