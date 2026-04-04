import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, MessageSquare, Search, Plus, X, Check,
  TrendingUp, Leaf, Bug, CloudSun, Tractor, HelpCircle, Filter,
  Heart, MessageCircle, Eye, Clock, LogIn, Edit2, Trash2, Share,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { MediaUpload, MediaFile } from "@/components/MediaUpload";
import { MediaGallery, MediaData } from "@/components/MediaGallery";
import { uploadMediaToSupabase, getPostMedia, deletePostMedia } from "@/lib/mediaService";
import { useTranslation } from "react-i18next";

const categories = [
  { id: "all", labelKey: "community.categories.all", fallback: "All Topics", icon: Users },
  { id: "crops", labelKey: "community.categories.crops", fallback: "Crop Tips", icon: Leaf },
  { id: "pests", labelKey: "community.categories.pests", fallback: "Pest & Disease", icon: Bug },
  { id: "weather", labelKey: "community.categories.weather", fallback: "Weather Talk", icon: CloudSun },
  { id: "equipment", labelKey: "community.categories.equipment", fallback: "Equipment", icon: Tractor },
  { id: "market", labelKey: "community.categories.market", fallback: "Market Trends", icon: TrendingUp },
  { id: "help", labelKey: "community.categories.help", fallback: "Ask for Help", icon: HelpCircle },
];

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  created_at: string;
  likes_count: number;
  user_id: string;
  liked_by_user: boolean;
}

interface Post {
  id: string;
  user_id: string;
  author: string;
  avatar: string;
  location?: string;
  category: string;
  title: string;
  content: string;
  image?: string;
  media?: MediaData[];
  likes_count: number;
  comments: Comment[];
  views_count: number;
  created_at: string;
  tags: string[];
  liked_by_user: boolean;
  bookmarked_by_user: boolean;
}

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const sb = supabase as any;

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // New post form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newPostMedia, setNewPostMedia] = useState<MediaFile[]>([]);

  // Edit post form
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");

  // Fetch posts from Supabase with comments and like status
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["communityPosts", user?.id],
    queryFn: async () => {
      const { data, error } = await sb
        .from("community_posts")
        .select("id, user_id, title, content, category, tags, likes_count, views_count, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!data) return [];

      // Fetch user full names
      const userIds = Array.from(new Set((data as Array<{ user_id: string }>).map((p) => p.user_id)));
      const { data: profilesData } = await sb
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map<string, string>(
        profilesData?.map((p: { user_id: string; full_name: string }) => [p.user_id, p.full_name]) || []
      );

      // Fetch comments for each post
      const postsWithComments: Post[] = await Promise.all(
        (
          data as Array<{
            id: string;
            user_id: string;
            title: string;
            content: string;
            category: string;
            tags: string[];
            likes_count: number;
            views_count: number;
            created_at: string;
          }>
        ).map(async (post) => {
          // Fetch comments
          const { data: commentsData } = await sb
            .from("community_comments")
            .select("id, user_id, content, likes_count, created_at")
            .eq("post_id", post.id)
            .order("created_at", { ascending: true });

          // Fetch comment authors
          let comments: Comment[] = [];
          if (commentsData && commentsData.length > 0) {
            const commentUserIds = Array.from(
              new Set(commentsData.map((c: { user_id: string }) => c.user_id))
            );
            const { data: commentProfiles } = await sb
              .from("profiles")
              .select("user_id, full_name")
              .in("user_id", commentUserIds);

            const commentProfileMap = new Map<string, string>(
              commentProfiles?.map((p: { user_id: string; full_name: string }) => [
                p.user_id,
                p.full_name,
              ]) || []
            );

            // Fetch comment likes by current user
            let commentLikeMap = new Map<string, boolean>();
            if (isAuthenticated && user) {
              const { data: commentLikes } = await sb
                .from("community_comment_likes")
                .select("comment_id")
                .eq("user_id", user.id)
                .in(
                  "comment_id",
                  commentsData.map((c: { id: string }) => c.id)
                );

              commentLikeMap = new Map(
                commentLikes?.map((cl: { comment_id: string }) => [cl.comment_id, true]) || []
              );
            }

            comments = commentsData.map(
              (comment: {
                id: string;
                user_id: string;
                content: string;
                likes_count: number;
                created_at: string;
              }) => ({
                id: comment.id,
                author: commentProfileMap.get(comment.user_id) || t("community.defaults.farmer", "Farmer"),
                avatar: (commentProfileMap.get(comment.user_id) || "F")[0].toUpperCase(),
                content: comment.content,
                created_at: comment.created_at,
                likes_count: comment.likes_count || 0,
                user_id: comment.user_id,
                liked_by_user: !!commentLikeMap.get(comment.id),
              })
            );
          }

          // Check if current user liked this post
          let liked_by_user = false;
          if (isAuthenticated && user) {
            const { data: userLike } = await sb
              .from("community_post_likes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
              .maybeSingle();

            liked_by_user = !!userLike;
          }

          const fullName = profileMap.get(post.user_id) || t("community.defaults.farmer", "Farmer");
          
          // Fetch media for this post from database
          const media = await getPostMedia(post.id);
          
          return {
            id: post.id,
            user_id: post.user_id,
            author: fullName,
            avatar: fullName[0].toUpperCase(),
            category: post.category,
            title: post.title,
            content: post.content,
            likes_count: post.likes_count || 0,
            comments,
            views_count: post.views_count || 0,
            created_at: post.created_at,
            tags: post.tags || [],
            liked_by_user,
            bookmarked_by_user: false,
            media: media && media.length > 0 ? media : undefined,
          };
        })
      );

      return postsWithComments;
    },
    enabled: true,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      mediaFiles?: File[];
    }) => {
      // Create the post first
      const { data: newPost, error: postError } = await sb.from("community_posts").insert([
        {
          user_id: user?.id,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
        },
      ]).select().single();

      if (postError) throw postError;
      if (!newPost) throw new Error("Failed to create post");

      // Upload media files if provided
      if (data.mediaFiles && data.mediaFiles.length > 0) {
        await uploadMediaToSupabase(data.mediaFiles, user?.id || "", newPost.id);
      }

      return newPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setNewTitle("");
      setNewContent("");
      setNewCategory("");
      setNewTags("");
      setNewPostMedia([]);
      setShowCreateDialog(false);
      toast({ title: t("community.toast.success", "Success"), description: t("community.toast.postPublished", "Post published! Media is now visible to all users.") });
    },
    onError: (error: Error) => {
      toast({ title: t("community.toast.error", "Error"), description: error.message, variant: "destructive" });
    },
  });

  // Increment view count
  const incrementViewMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await sb.rpc("increment_post_views", { post_id: postId });
      if (error) throw error;
    },
    onError: () => {
      // Silently fail - not critical
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) throw new Error("Post not found");

      if (post.liked_by_user) {
        await sb
          .from("community_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user?.id);
      } else {
        await sb
          .from("community_post_likes")
          .insert([{ post_id: postId, user_id: user?.id }]);
      }
    },
    onMutate: async (postId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["communityPosts", user?.id] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(["communityPosts", user?.id]) || [];

      // Optimistically update the cache
      const updatedPosts = previousPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            liked_by_user: !p.liked_by_user,
            likes_count: p.liked_by_user ? p.likes_count - 1 : p.likes_count + 1,
          };
        }
        return p;
      });

      queryClient.setQueryData(["communityPosts", user?.id], updatedPosts);

      return { previousPosts };
    },
    onSuccess: () => {
      // Query is already updated via onMutate, no need to refetch
    },
    onError: (error: Error, _postId: string, context: any) => {
      // Revert to previous data if mutation fails
      if (context?.previousPosts) {
        queryClient.setQueryData(["communityPosts", user?.id], context.previousPosts);
      }
      toast({ title: t("community.toast.likePostError", "Error liking post"), description: t("community.toast.tryAgain", "Please try again"), variant: "destructive" });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { postId: string; content: string }) => {
      const { error } = await sb.from("community_comments").insert([
        {
          post_id: data.postId,
          user_id: user?.id,
          content: data.content,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast({ title: t("community.toast.success", "Success"), description: t("community.toast.commentAdded", "Comment added!") });
    },
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: async (data: {
      postId: string;
      title: string;
      content: string;
      category: string;
      tags: string[];
    }) => {
      const { error } = await sb
        .from("community_posts")
        .update({
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
        })
        .eq("id", data.postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setShowEditDialog(false);
      setSelectedPost(null);
      toast({ title: t("community.toast.success", "Success"), description: t("community.toast.postUpdated", "Post updated!") });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Delete media files first
      await deletePostMedia(postId);

      // Then delete the post
      const { error } = await sb
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setSelectedPost(null);
      toast({ title: t("community.toast.success", "Success"), description: t("community.toast.postDeleted", "Post deleted!") });
    },
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const comment = selectedPost?.comments.find((c) => c.id === commentId);
      if (!comment) throw new Error("Comment not found");

      if (comment.liked_by_user) {
        await sb
          .from("community_comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user?.id);
      } else {
        await sb
          .from("community_comment_likes")
          .insert([{ comment_id: commentId, user_id: user?.id }]);
      }
    },
    onMutate: async (commentId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["communityPosts", user?.id] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(["communityPosts", user?.id]) || [];

      // Optimistically update the selected post's comments
      const updatedPosts = previousPosts.map((p) => {
        if (p.id === selectedPost?.id) {
          return {
            ...p,
            comments: p.comments.map((c) => {
              if (c.id === commentId) {
                return {
                  ...c,
                  liked_by_user: !c.liked_by_user,
                  likes_count: c.liked_by_user ? c.likes_count - 1 : c.likes_count + 1,
                };
              }
              return c;
            }),
          };
        }
        return p;
      });

      queryClient.setQueryData(["communityPosts", user?.id], updatedPosts);

      // Also update selectedPost for immediate UI feedback
      if (selectedPost) {
        const updatedSelectedPost = {
          ...selectedPost,
          comments: selectedPost.comments.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                liked_by_user: !c.liked_by_user,
                likes_count: c.liked_by_user ? c.likes_count - 1 : c.likes_count + 1,
              };
            }
            return c;
          }),
        };
        setSelectedPost(updatedSelectedPost);
      }

      return { previousPosts };
    },
    onSuccess: () => {
      // Query is already updated via onMutate
    },
    onError: (error: Error, _commentId: string, context: any) => {
      // Revert to previous data if mutation fails
      if (context?.previousPosts) {
        queryClient.setQueryData(["communityPosts", user?.id], context.previousPosts);
      }
      toast({ title: t("community.toast.likeCommentError", "Error liking comment"), description: t("community.toast.tryAgain", "Please try again"), variant: "destructive" });
    },
  });

  const filteredPosts = posts
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .filter(
      (p) =>
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags &&
          p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === "popular") return (b.likes_count || 0) - (a.likes_count || 0);
      if (sortBy === "mostViewed") return (b.views_count || 0) - (a.views_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!newTitle.trim() || !newContent.trim() || !newCategory) {
      toast({ title: t("community.toast.error", "Error"), description: t("community.toast.fillRequired", "Please fill all required fields"), variant: "destructive" });
      return;
    }

    createPostMutation.mutate({
      title: newTitle,
      content: newContent,
      category: newCategory,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      mediaFiles: newPostMedia.length > 0 ? newPostMedia.map(m => m.file) : undefined,
    });
  };

  const handleAddComment = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!newComment.trim() || !selectedPost) return;
    addCommentMutation.mutate({
      postId: selectedPost.id,
      content: newComment,
    });
  };

  const handleLike = (postId: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    likePostMutation.mutate(postId);
  };

  const handleOpenPost = (post: Post) => {
    setSelectedPost(post);
    incrementViewMutation.mutate(post.id);
  };

  const handleOpenEdit = () => {
    if (!selectedPost) return;
    setEditTitle(selectedPost.title);
    setEditContent(selectedPost.content);
    setEditCategory(selectedPost.category);
    setEditTags(selectedPost.tags.join(", "));
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPost || !editTitle.trim() || !editContent.trim() || !editCategory) return;
    editPostMutation.mutate({
      postId: selectedPost.id,
      title: editTitle,
      content: editContent,
      category: editCategory,
      tags: editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  const handleDeletePost = () => {
    if (!selectedPost) return;
    if (confirm(t("community.confirmDelete", "Are you sure you want to delete this post?"))) {
      deletePostMutation.mutate(selectedPost.id);
    }
  };

  const handleSharePost = (post: Post) => {
    const message = t("community.shareMessage", "Check out this post: \"{{title}}\" on Agri Companion", { title: post.title });
    const url = `${window.location.origin}/community`;

    if (navigator.share) {
      navigator.share({ title: t("community.appName", "Agri Companion"), text: message, url });
    } else {
      const shareUrl = `${url}?post=${post.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2000);
      toast({ title: t("community.toast.linkCopied", "Link copied"), description: t("community.toast.linkCopiedDescription", "Post link copied to clipboard!") });
    }
  };

  const handleLikeComment = (commentId: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    likeCommentMutation.mutate(commentId);
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      crops: "bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-400",
      pests: "bg-red-500/15 text-red-700 border-red-200 dark:text-red-400",
      weather: "bg-blue-500/15 text-blue-700 border-blue-200 dark:text-blue-400",
      equipment: "bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-400",
      market: "bg-violet-500/15 text-violet-700 border-violet-200 dark:text-violet-400",
      help: "bg-pink-500/15 text-pink-700 border-pink-200 dark:text-pink-400",
    };
    return map[cat] || "bg-gray-500/15 text-gray-700 border-gray-200";
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (seconds < 60) return t("community.time.justNow", "Just now");
    if (seconds < 3600) return t("community.time.minutesAgo", "{{count}}m ago", { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t("community.time.hoursAgo", "{{count}}h ago", { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t("community.time.daysAgo", "{{count}}d ago", { count: Math.floor(seconds / 86400) });
    return postDate.toLocaleDateString();
  };

  const getCategoryLabel = (cat: string) =>
    t(
      categories.find((c) => c.id === cat)?.labelKey || "community.categories.general",
      categories.find((c) => c.id === cat)?.fallback || "General"
    );

  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
  const helpPosts = posts.filter((post) => post.category === "help").length;

  // Suppress unused variable warning for useEffect
  void useEffect;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{t("community.title", "Community Forum")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
            {isAuthenticated
              ? t("community.subtitle.authenticated", "Connect, share, and learn from fellow farmers")
              : t("community.subtitle.guest", "Sign in to join the conversation")}
            </p>
          </div>
        {isAuthenticated ? (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-warm text-secondary-foreground border-0 hover:opacity-90 gap-2 h-10 shadow-md">
                <Plus className="w-4 h-4" /> {t("community.actions.newPost", "New Post")}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-h-[90vh] overflow-y-auto sm:max-w-2xl mx-4">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">{t("community.dialog.shareKnowledge", "Share Your Knowledge")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <label className="text-sm font-medium mb-2 block">{t("community.fields.postTitle", "Post Title")}</label>
                  <Input
                    placeholder={t("community.fields.postTitlePlaceholder", "What's on your mind?")}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="border-2 bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("community.fields.category", "Category")}</label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="border-2 bg-background">
                      <SelectValue placeholder={t("community.fields.selectCategory", "Select category")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.id !== "all")
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {t(c.labelKey, c.fallback)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("community.fields.description", "Description")}</label>
                  <Textarea
                    placeholder={t("community.fields.descriptionPlaceholder", "Share your experience, tips, or ask a question...")}
                    rows={5}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="border-2 bg-background resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("community.fields.tags", "Tags (comma-separated)")}</label>
                  <Input
                    placeholder={t("community.fields.tagsPlaceholder", "e.g., wheat, organic, rabi")}
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="border-2 bg-background"
                  />
                </div>
                {newPostMedia.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Selected Media ({newPostMedia.length})</label>
                    <div className="flex gap-2 flex-wrap">
                      {newPostMedia.map((m) => (
                        <div key={m.id} className="relative rounded-lg overflow-hidden bg-muted border border-border group w-16 h-16">
                          {m.type === "image" ? (
                            <img src={m.preview} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <span className="text-xs text-white">Video</span>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              const updated = newPostMedia.filter((x) => x.id !== m.id);
                              setNewPostMedia(updated);
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-xl border border-dashed border-border p-3 bg-muted/30">
                  <MediaUpload onMediaSelect={setNewPostMedia} selectedMedia={newPostMedia} maxFiles={5} />
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="w-full gradient-warm text-secondary-foreground border-0 h-10 shadow-md"
                >
                  {createPostMutation.isPending ? t("community.actions.publishing", "Publishing...") : t("community.actions.publishPost", "Publish Post")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            onClick={() => navigate("/auth")}
            className="gradient-warm text-secondary-foreground border-0 gap-2 h-10 shadow-md"
          >
            <LogIn className="w-4 h-4" /> {t("community.actions.signInToPost", "Sign In to Post")}
          </Button>
        )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3">
            <p className="text-xs text-muted-foreground">{t("community.stats.totalPosts", "Total Posts")}</p>
            <p className="text-xl font-semibold text-foreground">{posts.length}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3">
            <p className="text-xs text-muted-foreground">{t("community.stats.communityReplies", "Community Replies")}</p>
            <p className="text-xl font-semibold text-foreground">{totalComments}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3">
            <p className="text-xs text-muted-foreground">{t("community.stats.helpRequests", "Help Requests")}</p>
            <p className="text-xl font-semibold text-foreground">{helpPosts}</p>
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("community.searchPlaceholder", "Search posts and tags...")}
            className="pl-9 border-2 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full lg:w-56 border-2 bg-background">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t("community.sort.recent", "Most Recent")}</SelectItem>
            <SelectItem value="popular">{t("community.sort.popular", "Most Liked")}</SelectItem>
            <SelectItem value="mostViewed">{t("community.sort.mostViewed", "Most Viewed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {t(cat.labelKey, cat.fallback)}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="rounded-2xl border border-border p-5 animate-pulse">
                <div className="h-4 w-40 bg-muted rounded mb-3" />
                <div className="h-3 w-full bg-muted rounded mb-2" />
                <div className="h-3 w-3/4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
                onClick={() => handleOpenPost(post)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shrink-0 shadow-sm">
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-sm text-foreground">{post.author}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {getTimeAgo(post.created_at)}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                      {post.content}
                    </p>
                    {post.media && post.media.length > 0 && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-border/60 bg-muted/35">
                        <div className="relative flex items-center justify-center bg-gradient-to-b from-muted/80 to-muted/40 p-2 sm:p-3">
                          {post.media[0].type === "image" ? (
                            <img
                              src={post.media[0].url}
                              alt="Post media preview"
                              className="w-full max-h-[480px] object-contain rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-56 sm:h-72 bg-black rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-medium">{t("community.videoAttached", "Video attached")}</span>
                            </div>
                          )}
                          {post.media.length > 1 && (
                            <div className="absolute top-2 right-2 rounded-full bg-black/70 text-white text-xs px-2 py-1">
                              +{post.media.length - 1} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <Badge className={`${getCategoryColor(post.category)} border`}>
                        {getCategoryLabel(post.category)}
                      </Badge>
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center flex-wrap gap-2 text-muted-foreground border-t border-border/60 pt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
                          post.liked_by_user
                            ? "text-red-500 border-red-200 bg-red-500/10"
                            : "border-border bg-background hover:text-red-500 hover:border-red-200"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${post.liked_by_user ? "fill-current" : ""}`}
                        />
                        {post.likes_count}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPost(post);
                        }}
                        className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border border-border bg-background hover:border-primary/30 hover:text-foreground transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> {post.comments.length}
                      </button>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border border-border bg-background">
                        <Eye className="w-4 h-4" /> {post.views_count}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">{t("community.empty.noPosts", "No posts found")}</p>
            <p className="text-sm mt-2">
              {isAuthenticated
                ? t("community.empty.authenticated", "Be the first to post in this category!")
                : t("community.empty.guest", "Sign in to start posting and joining discussions")}
            </p>
          </div>
        )}
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="w-full max-h-[90vh] overflow-y-auto sm:max-w-2xl mx-4">
          {selectedPost && (
            <>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-11 h-11 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shrink-0">
                      {selectedPost.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{selectedPost.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(selectedPost.created_at)}
                      </p>
                    </div>
                  </div>
                  {user?.id === selectedPost.user_id && (
                    <div className="flex gap-1">
                      <Button
                        onClick={handleOpenEdit}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleDeletePost}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <DialogTitle className="font-heading text-xl mt-4">
                  {selectedPost.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>

                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3">{t("community.attachedMedia", "Attached Media")}</h4>
                    <MediaGallery media={selectedPost.media} />
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getCategoryColor(selectedPost.category)} border`}>
                    {getCategoryLabel(selectedPost.category)}
                  </Badge>
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-muted-foreground border-y border-border py-4">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-all ${
                      selectedPost.liked_by_user ? "text-red-500" : "hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${selectedPost.liked_by_user ? "fill-current" : ""}`}
                    />
                    {selectedPost.likes_count} {t("community.likes", "Likes")}
                  </button>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Eye className="w-4 h-4" /> {selectedPost.views_count} {t("community.views", "Views")}
                  </span>
                  <button
                    onClick={() => handleSharePost(selectedPost)}
                    className="flex items-center gap-2 text-sm font-medium hover:text-foreground ml-auto"
                  >
                    {copiedPostId === selectedPost.id ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" /> {t("community.actions.copied", "Copied")}
                      </>
                    ) : (
                      <>
                        <Share className="w-4 h-4" /> {t("community.actions.share", "Share")}
                      </>
                    )}
                  </button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h4 className="font-heading font-semibold text-base">
                    {t("community.comments", "Comments")} ({selectedPost.comments.length})
                  </h4>

                  {isAuthenticated ? (
                    <div className="flex gap-3 bg-muted/30 rounded-lg p-4">
                      <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-xs shrink-0 mt-1">
                        {user?.email?.[0].toUpperCase() || "Y"}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          placeholder={t("community.commentPlaceholder", "Share your thoughts...")}
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="border-2 resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              handleAddComment();
                            }
                          }}
                        />
                        <Button
                          onClick={handleAddComment}
                          disabled={addCommentMutation.isPending || !newComment.trim()}
                          className="self-end gradient-warm text-secondary-foreground border-0 h-10"
                        >
                          {addCommentMutation.isPending ? "..." : t("community.actions.post", "Post")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">{t("community.signInToComment", "Sign in to comment")}</p>
                      <Button
                        onClick={() => navigate("/auth")}
                        className="gradient-warm text-secondary-foreground border-0 gap-2"
                      >
                        <LogIn className="w-4 h-4" /> {t("community.actions.signIn", "Sign In")}
                      </Button>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-3 mt-6">
                    {selectedPost.comments.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-6">
                        {t("community.empty.noComments", "No comments yet. Be the first to comment!")}
                      </p>
                    ) : (
                      selectedPost.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 bg-muted/30 rounded-lg p-4">
                          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-heading font-bold text-xs shrink-0 mt-1">
                            {comment.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                              {comment.content}
                            </p>
                            {isAuthenticated && (
                              <button
                                onClick={() => handleLikeComment(comment.id)}
                                className={`flex items-center gap-1 text-xs font-medium transition-all ${
                                  comment.liked_by_user
                                    ? "text-red-500"
                                    : "text-muted-foreground hover:text-red-500"
                                }`}
                              >
                                <Heart
                                  className={`w-3 h-3 ${comment.liked_by_user ? "fill-current" : ""}`}
                                />
                                {comment.likes_count}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-full max-w-sm sm:max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("community.actions.editPost", "Edit Post")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t("community.fields.title", "Title")}</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("community.fields.category", "Category")}</label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.id !== "all")
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {t(c.labelKey, c.fallback)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("community.fields.description", "Description")}</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="border-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("community.fields.tags", "Tags")}</label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="border-2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                disabled={editPostMutation.isPending}
                className="flex-1 gradient-warm text-secondary-foreground border-0"
              >
                {editPostMutation.isPending ? t("community.actions.saving", "Saving...") : t("community.actions.saveChanges", "Save Changes")}
              </Button>
              <Button
                onClick={() => setShowEditDialog(false)}
                variant="outline"
                className="flex-1"
              >
                {t("community.actions.cancel", "Cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}