import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Skill {
    id: string;
    status: string;
    title: string;
    authorId: string;
    createdAt: bigint;
    tags: Array<string>;
    authorName: string;
    description: string;
    offeredSkill: string;
    category: string;
    wantedSkill: string;
}
export interface Notification {
    id: string;
    title: string;
    userId: string;
    notificationType: string;
    createdAt: bigint;
    isRead: boolean;
    message: string;
    relatedId: string;
}
export interface User {
    id: string;
    bio: string;
    username: string;
    createdAt: bigint;
    role: string;
    email: string;
    offeredSkills: Array<string>;
    wantedSkills: Array<string>;
    avatarUrl: string;
}
export interface Exchange {
    id: string;
    status: string;
    skillId: string;
    createdAt: bigint;
    skillTitle: string;
    updatedAt: bigint;
    message: string;
    providerName: string;
    requesterName: string;
    providerId: string;
    requesterId: string;
}
export interface PopulateSampleDataResult {
    sampleSkills: Array<Skill>;
    sampleNotifications: Array<Notification>;
    sampleUsers: Array<User>;
    sampleExchanges: Array<Exchange>;
}
export interface UserProfile {
    bio: string;
    username: string;
    email: string;
    offeredSkills: Array<string>;
    wantedSkills: Array<string>;
    avatarUrl: string;
}
export enum SortOrder {
    asc = "asc",
    desc = "desc"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptRequest(id: string): Promise<Exchange | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createNotification(userId: string, title: string, message: string, notificationType: string, relatedId: string): Promise<Notification>;
    createSkill(title: string, description: string, category: string, offeredSkill: string, wantedSkill: string, authorId: string, authorName: string, tags: Array<string>): Promise<Skill>;
    declineRequest(id: string): Promise<Exchange | null>;
    deleteNotification(id: string): Promise<boolean>;
    deleteSkill(id: string): Promise<boolean>;
    deleteUser(id: string): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExchangeById(id: string): Promise<Exchange | null>;
    getNotifications(userId: string): Promise<Array<Notification>>;
    getSkillById(id: string): Promise<Skill | null>;
    getUnreadCount(userId: string): Promise<bigint>;
    getUserById(id: string): Promise<User | null>;
    getUserByPrincipal(principal: Principal): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(principal: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listAll(): Promise<Array<Exchange>>;
    listByCategory(category: string): Promise<Array<Skill>>;
    listByUser(userId: string): Promise<Array<Exchange>>;
    listSkills(): Promise<Array<Skill>>;
    listUsers(): Promise<Array<User>>;
    markAllRead(userId: string): Promise<bigint>;
    markRead(id: string): Promise<boolean>;
    populateSampleData(): Promise<PopulateSampleDataResult>;
    promoteToAdmin(id: string): Promise<boolean>;
    registerUser(username: string, email: string, bio: string): Promise<User>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSkills(searchTerm: string, sortOrder: SortOrder): Promise<Array<Skill>>;
    sendRequest(requesterId: string, requesterName: string, providerId: string, providerName: string, skillId: string, skillTitle: string, message: string): Promise<Exchange>;
    setStatus(id: string, status: string): Promise<boolean>;
    updateProfile(id: string, bio: string, offeredSkills: Array<string>, wantedSkills: Array<string>): Promise<User | null>;
    updateSkill(id: string, title: string, description: string, tags: Array<string>): Promise<Skill | null>;
}
