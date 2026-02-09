import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface InquirySummary {
    girlsNightOut: bigint;
    generalDIY: bigint;
    birthdayPartyKids: bigint;
    birthdayPartyAdult: bigint;
    corporateTeamBuilding: bigint;
    fieldTrips: bigint;
    bacheloretteBridalShower: bigint;
}
export interface HookTemplate {
    title: string;
    content: string;
}
export interface FacebookOutreachEntry {
    id: bigint;
    typeOfInterest: TypeOfInterest;
    owner: Principal;
    createdAt: bigint;
    postContent: string;
    responseStatus: ResponseStatus;
    updatedAt: bigint;
    numReactions: bigint;
    datePosted: string;
    groupUrl: string;
    numComments: bigint;
    leadContactInfo: string;
    craftCategory: CraftCategory;
    groupName: string;
    attachment?: ExternalBlob;
    followUpDate: string;
    eventType: EventType;
}
export interface UserProfile {
    name: string;
}
export enum CraftCategory {
    CandleMaking = "CandleMaking",
    SoapMaking = "SoapMaking",
    SplatterRoom = "SplatterRoom"
}
export enum EventType {
    GeneralDIYIndividual = "GeneralDIYIndividual",
    BirthdayPartyKids = "BirthdayPartyKids",
    BirthdayPartyAdult = "BirthdayPartyAdult",
    BacheloretteBridalShower = "BacheloretteBridalShower",
    GirlsNightOut = "GirlsNightOut",
    CorporateTeamBuilding = "CorporateTeamBuilding",
    FieldTrips = "FieldTrips"
}
export enum ResponseStatus {
    LeadsGenerated = "LeadsGenerated",
    NoResponse = "NoResponse",
    ActiveDiscussion = "ActiveDiscussion",
    NegativeFeedback = "NegativeFeedback"
}
export enum TypeOfInterest {
    Availability = "Availability",
    Price = "Price",
    GroupBooking = "GroupBooking"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntry(groupName: string, groupUrl: string, datePosted: string, postContent: string, numReactions: bigint, numComments: bigint, responseStatus: ResponseStatus, followUpDate: string, craftCategory: CraftCategory, typeOfInterest: TypeOfInterest, eventType: EventType, leadContactInfo: string, attachment: ExternalBlob | null): Promise<FacebookOutreachEntry>;
    deleteEntry(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntry(id: bigint): Promise<FacebookOutreachEntry>;
    getFollowUpToday(today: string): Promise<Array<FacebookOutreachEntry>>;
    getGroupNotes(groupUrl: string): Promise<string | null>;
    getGroupResponseSummary(): Promise<Array<[string, bigint]>>;
    getHookTemplatesForCaller(): Promise<Array<HookTemplate>>;
    getInquirySummaryByEventType(): Promise<InquirySummary>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    health(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listAllGroupNotes(): Promise<Array<[string, string]>>;
    listEntries(page: bigint, pageSize: bigint): Promise<Array<FacebookOutreachEntry>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveHookTemplates(templates: Array<HookTemplate>): Promise<void>;
    setGroupNotes(groupUrl: string, notes: string): Promise<void>;
    updateEntry(id: bigint, groupName: string, groupUrl: string, datePosted: string, postContent: string, numReactions: bigint, numComments: bigint, responseStatus: ResponseStatus, followUpDate: string, craftCategory: CraftCategory, typeOfInterest: TypeOfInterest, eventType: EventType, leadContactInfo: string, attachment: ExternalBlob | null): Promise<FacebookOutreachEntry>;
}
