import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, UserPlus, UserMinus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Members() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: myFollows = [] } = useQuery({
    queryKey: ["myFollows"],
    queryFn: () => base44.entities.UserFollow.list(),
    initialData: [],
    enabled: !!currentUser,
  });

  const followMutation = useMutation({
    mutationFn: async (userEmail) => {
      const existingFollow = myFollows.find(f => f.followingEmail === userEmail);
      if (existingFollow) {
        await base44.entities.UserFollow.delete(existingFollow.id);
      } else {
        await base44.entities.UserFollow.create({ followingEmail: userEmail });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myFollows"] });
    },
  });

  const isFollowing = (userEmail) => {
    return myFollows.some(f => f.followingEmail === userEmail);
  };

  const filteredUsers = users
    .filter(u => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.bio?.toLowerCase().includes(query)
      );
    })
    .filter(u => {
      if (filterBy === "all") return true;
      if (filterBy === "experts") return ["expert", "contributor"].includes(u.role);
      if (filterBy === "following") return isFollowing(u.email);
      return true;
    })
    .filter(u => u.email !== currentUser?.email);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#4A1228] mb-4">Members</h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search members by name, email, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <Tabs value={filterBy} onValueChange={setFilterBy}>
            <TabsList>
              <TabsTrigger value="all">All Members</TabsTrigger>
              <TabsTrigger value="experts">Experts</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src={user.profile_picture} />
                    <AvatarFallback className="bg-[#6B1B3D] text-white text-2xl">
                      {user.full_name?.[0] || user.email?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="font-semibold text-lg mb-1">{user.full_name || "Anonymous"}</h3>
                  
                  {user.role && ["admin", "expert", "moderator", "contributor"].includes(user.role) && (
                    <Badge className="mb-3 bg-[#6B1B3D] text-white">
                      {user.role}
                    </Badge>
                  )}

                  {user.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex gap-2 w-full mt-auto">
                    <Button
                      onClick={() => followMutation.mutate(user.email)}
                      variant={isFollowing(user.email) ? "outline" : "default"}
                      className={`flex-1 ${
                        !isFollowing(user.email) && "bg-[#6B1B3D] hover:bg-[#4A1228]"
                      }`}
                      size="sm"
                    >
                      {isFollowing(user.email) ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                    
                    <Link to={createPageUrl("Messages") + `?user=${user.email}`}>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <p>No members found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}