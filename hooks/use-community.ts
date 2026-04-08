/**
 * BPK Hub — Community TanStack Query Hooks
 * Cached data fetching for post list, detail, comments, like/scrap toggle.
 */
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  fetchPosts,
  fetchPost,
  fetchComments,
  createPost,
  updatePost,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
  togglePostLike,
  togglePostScrap,
  type PostListParams,
  type PostListItem,
  type PostDetail,
  type PostCreateRequest,
  type PostUpdateRequest,
  type CommentCreateRequest,
  type CommentUpdateRequest,
  type PaginatedResponse,
} from '@/lib/api/community';

// ── Query Key Factory ────────────────────────────────────────────────────────

export const communityKeys = {
  all: ['community'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (params: PostListParams) =>
    [...communityKeys.lists(), params] as const,
  details: () => [...communityKeys.all, 'detail'] as const,
  detail: (id: string) => [...communityKeys.details(), id] as const,
  comments: (postId: string) =>
    [...communityKeys.all, 'comments', postId] as const,
};

// ── Post Queries ─────────────────────────────────────────────────────────────

/** 게시글 목록 조회 훅 */
export function usePosts(params: PostListParams = {}) {
  return useQuery({
    queryKey: communityKeys.list(params),
    queryFn: () => fetchPosts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 게시글 상세 조회 훅 */
export function usePost(id: string) {
  return useQuery({
    queryKey: communityKeys.detail(id),
    queryFn: () => fetchPost(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** 댓글 목록 조회 훅 */
export function useComments(postId: string) {
  return useQuery({
    queryKey: communityKeys.comments(postId),
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
    staleTime: 30_000,
  });
}

// ── Post Mutations ───────────────────────────────────────────────────────────

/** 게시글 작성 mutation */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostCreateRequest) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
    },
  });
}

/** 게시글 수정 mutation */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostUpdateRequest }) =>
      updatePost(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
    },
  });
}

/** 게시글 삭제 mutation */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
    },
  });
}

// ── Comment Mutations ────────────────────────────────────────────────────────

/** 댓글 작성 mutation */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CommentCreateRequest) => createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.comments(postId),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.detail(postId),
      });
    },
  });
}

/** 댓글 수정 mutation */
export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: CommentUpdateRequest;
    }) => updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.comments(postId),
      });
    },
  });
}

/** 댓글 삭제 mutation */
export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.comments(postId),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.detail(postId),
      });
    },
  });
}

// ── Like / Scrap Toggle ─────────────────────────────────────────────────────

/** 좋아요 토글 mutation — optimistic update */
export function useToggleLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => togglePostLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: communityKeys.lists() });
      await queryClient.cancelQueries({
        queryKey: communityKeys.detail(postId),
      });

      // Optimistic update on lists
      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<PostListItem>
      >({ queryKey: communityKeys.lists() });

      queryClient.setQueriesData<PaginatedResponse<PostListItem>>(
        { queryKey: communityKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === postId
                ? {
                    ...item,
                    is_liked: !item.is_liked,
                    like_count: item.is_liked
                      ? item.like_count - 1
                      : item.like_count + 1,
                  }
                : item,
            ),
          };
        },
      );

      // Optimistic update on detail
      const previousDetail = queryClient.getQueryData<PostDetail>(
        communityKeys.detail(postId),
      );
      if (previousDetail) {
        queryClient.setQueryData<PostDetail>(
          communityKeys.detail(postId),
          {
            ...previousDetail,
            is_liked: !previousDetail.is_liked,
            like_count: previousDetail.is_liked
              ? previousDetail.like_count - 1
              : previousDetail.like_count + 1,
          },
        );
      }

      return { previousLists, previousDetail };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLists) {
        for (const [queryKey, data] of context.previousLists) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          communityKeys.detail(postId),
          context.previousDetail,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: communityKeys.detail(postId),
      });
    },
  });
}

/** 스크랩 토글 mutation — optimistic update */
export function useToggleScrap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => togglePostScrap(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: communityKeys.lists() });

      const previousQueries = queryClient.getQueriesData<
        PaginatedResponse<PostListItem>
      >({ queryKey: communityKeys.lists() });

      queryClient.setQueriesData<PaginatedResponse<PostListItem>>(
        { queryKey: communityKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === postId
                ? { ...item, is_scrapped: !item.is_scrapped }
                : item,
            ),
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: communityKeys.details() });
    },
  });
}
