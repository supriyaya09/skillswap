import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SortOrder } from "../backend";
import type { Exchange, Notification, Skill, User } from "../backend.d.ts";
import { createActorWithConfig } from "../config";

export function useListSkills() {
  return useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: async () => {
      const backend = await createActorWithConfig();
      return backend.listSkills();
    },
  });
}

export function useSkillById(id: string) {
  return useQuery<Skill | null>({
    queryKey: ["skill", id],
    queryFn: async () => {
      if (!id) return null;
      const backend = await createActorWithConfig();
      return backend.getSkillById(id);
    },
    enabled: !!id,
  });
}

export function useListUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const backend = await createActorWithConfig();
      return backend.listUsers();
    },
  });
}

export function useUserById(id: string) {
  return useQuery<User | null>({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) return null;
      const backend = await createActorWithConfig();
      return backend.getUserById(id);
    },
    enabled: !!id,
  });
}

export function useExchangesByUser(userId: string) {
  return useQuery<Exchange[]>({
    queryKey: ["exchanges", userId],
    queryFn: async () => {
      if (!userId) return [];
      const backend = await createActorWithConfig();
      return backend.listByUser(userId);
    },
    enabled: !!userId,
  });
}

export function useAllExchanges() {
  return useQuery<Exchange[]>({
    queryKey: ["exchanges", "all"],
    queryFn: async () => {
      const backend = await createActorWithConfig();
      return backend.listAll();
    },
  });
}

export function useNotifications(userId: string) {
  return useQuery<Notification[]>({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const backend = await createActorWithConfig();
      return backend.getNotifications(userId);
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

export function useUnreadCount(userId: string) {
  return useQuery<bigint>({
    queryKey: ["unread", userId],
    queryFn: async () => {
      if (!userId) return 0n;
      const backend = await createActorWithConfig();
      return backend.getUnreadCount(userId);
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      description: string;
      category: string;
      offeredSkill: string;
      wantedSkill: string;
      authorId: string;
      authorName: string;
      tags: string[];
    }) => {
      const backend = await createActorWithConfig();
      return backend.createSkill(
        args.title,
        args.description,
        args.category,
        args.offeredSkill,
        args.wantedSkill,
        args.authorId,
        args.authorName,
        args.tags,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skills"] }),
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const backend = await createActorWithConfig();
      return backend.deleteSkill(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skills"] }),
  });
}

export function useSetSkillStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const backend = await createActorWithConfig();
      return backend.setStatus(id, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skills"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const backend = await createActorWithConfig();
      return backend.deleteUser(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function usePromoteToAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const backend = await createActorWithConfig();
      return backend.promoteToAdmin(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useSendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      requesterId: string;
      requesterName: string;
      providerId: string;
      providerName: string;
      skillId: string;
      skillTitle: string;
      message: string;
    }) => {
      const backend = await createActorWithConfig();
      return backend.sendRequest(
        args.requesterId,
        args.requesterName,
        args.providerId,
        args.providerName,
        args.skillId,
        args.skillTitle,
        args.message,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exchanges"] }),
  });
}

export function useAcceptRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const backend = await createActorWithConfig();
      return backend.acceptRequest(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exchanges"] }),
  });
}

export function useDeclineRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const backend = await createActorWithConfig();
      return backend.declineRequest(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exchanges"] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      bio: string;
      offeredSkills: string[];
      wantedSkills: string[];
    }) => {
      const backend = await createActorWithConfig();
      return backend.updateProfile(
        args.id,
        args.bio,
        args.offeredSkills,
        args.wantedSkills,
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["user", vars.id] }),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const backend = await createActorWithConfig();
      return backend.markRead(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const backend = await createActorWithConfig();
      return backend.markAllRead(userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export { SortOrder };
