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
export interface HookTemplate {
    title: string;
    content: string;
}
export interface FacebookOutreachEntry {
    id: bigint;
    createdAt: bigint;
    postContent: string;
    responseStatus: ResponseStatus;
    updatedAt: bigint;
    numReactions: bigint;
    datePosted: string;
    groupUrl: string;
    numComments: bigint;
    groupName: string;
    attachment?: ExternalBlob;
    followUpDate: string;
}
export interface UserProfile {
    name: string;
}
export enum ResponseStatus {
    LeadsGenerated = "LeadsGenerated",
    NoResponse = "NoResponse",
    ActiveDiscussion = "ActiveDiscussion",
    NegativeFeedback = "NegativeFeedback"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntry(groupName: string, groupUrl: string, datePosted: string, postContent: string, numReactions: bigint, numComments: bigint, responseStatus: ResponseStatus, followUpDate: string, attachment: ExternalBlob | null): Promise<FacebookOutreachEntry>;
    deleteEntry(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntry(id: bigint): Promise<FacebookOutreachEntry>;
    getFollowUpToday(today: string): Promise<Array<FacebookOutreachEntry>>;
    getGroupNotes(groupUrl: string): Promise<string | null>;
    getGroupResponseSummary(): Promise<Array<[string, bigint]>>;
    getHookTemplatesForCaller(): Promise<Array<HookTemplate>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllGroupNotes(): Promise<Array<[string, string]>>;
    listEntries(page: bigint, pageSize: bigint): Promise<Array<FacebookOutreachEntry>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveHookTemplates(templates: Array<HookTemplate>): Promise<void>;
    setGroupNotes(groupUrl: string, notes: string): Promise<void>;
    updateEntry(id: bigint, groupName: string, groupUrl: string, datePosted: string, postContent: string, numReactions: bigint, numComments: bigint, responseStatus: ResponseStatus, followUpDate: string, attachment: ExternalBlob | null): Promise<FacebookOutreachEntry>;
}
