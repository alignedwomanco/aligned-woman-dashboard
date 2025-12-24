import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  GripVertical,
  Edit,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SectionEditor from "./SectionEditor";
import ModuleEditor from "./ModuleEditor";
import PageEditor from "./PageEditor";

export default function CourseBuilderContent() {
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());

  const queryClient = useQueryClient();

  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => base44.entities.Section.list("order"),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list("order"),
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["modulePages"],
    queryFn: () => base44.entities.ModulePage.list("order"),
  });

  const deleteSection = useMutation({
    mutationFn: (id) => base44.entities.Section.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["sections"]);
      setSelectedSection(null);
    },
  });

  const deleteModule = useMutation({
    mutationFn: (id) => base44.entities.Module.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["modules"]),
  });

  const deletePage = useMutation({
    mutationFn: (id) => base44.entities.ModulePage.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["modulePages"]),
  });

  const toggleModuleVisibility = useMutation({
    mutationFn: ({ id, isEnabled }) =>
      base44.entities.Module.update(id, { isEnabled }),
    onSuccess: () => queryClient.invalidateQueries(["modules"]),
  });

  const reorderModules = useMutation({
    mutationFn: async ({ moduleId, newOrder, newSectionId }) => {
      await base44.entities.Module.update(moduleId, {
        order: newOrder,
        sectionId: newSectionId,
      });
    },
    onSuccess: () => queryClient.invalidateQueries(["modules"]),
  });

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const moduleId = draggableId.replace("module-", "");

    // Moving within same section
    if (source.droppableId === destination.droppableId) {
      const sectionId = source.droppableId.replace("section-", "");
      const sectionModules = modules
        .filter((m) => m.sectionId === sectionId)
        .sort((a, b) => a.order - b.order);

      const newModules = Array.from(sectionModules);
      const [moved] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, moved);

      // Update orders
      for (let i = 0; i < newModules.length; i++) {
        await reorderModules.mutateAsync({
          moduleId: newModules[i].id,
          newOrder: i,
          newSectionId: sectionId,
        });
      }
    } else {
      // Moving to different section
      const newSectionId = destination.droppableId.replace("section-", "");
      const destModules = modules.filter((m) => m.sectionId === newSectionId);

      await reorderModules.mutateAsync({
        moduleId,
        newOrder: destination.index,
        newSectionId,
      });

      // Reorder remaining modules in destination section
      for (let i = destination.index + 1; i < destModules.length + 1; i++) {
        if (destModules[i - destination.index - 1]) {
          await reorderModules.mutateAsync({
            moduleId: destModules[i - destination.index - 1].id,
            newOrder: i,
            newSectionId,
          });
        }
      }
    }
  };

  const getPhaseIcon = (phase) => {
    const icons = {
      Awareness: "A",
      Liberation: "L",
      Intention: "I",
      VisionEmbodiment: "V",
    };
    return icons[phase] || "?";
  };

  const toggleModuleExpanded = (moduleId) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#4A1228]">Course Builder</h2>
          <p className="text-gray-600">Create and manage learning sections</p>
        </div>
        <Button
          onClick={() => {
            setEditingSection(null);
            setSectionDialogOpen(true);
          }}
          className="bg-[#6B1B3D] hover:bg-[#4A1228]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Section
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sections List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sections ({sections.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedSection?.id === section.id
                    ? "border-[#6B1B3D] bg-pink-50"
                    : "border-gray-200 hover:border-pink-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#6B1B3D] text-white rounded-lg flex items-center justify-center font-bold">
                      {getPhaseIcon(section.phase)}
                    </div>
                    <span className="font-semibold">{section.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSection(section);
                        setSectionDialogOpen(true);
                      }}
                      className="p-1 hover:bg-white rounded"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this section?"))
                          deleteSection.mutate(section.id);
                      }}
                      className="p-1 hover:bg-white rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-600">
                  {modules.filter((m) => m.sectionId === section.id).length}{" "}
                  modules
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Modules and Pages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedSection
                  ? `${selectedSection.name} - Modules`
                  : "Select a section"}
              </CardTitle>
              {selectedSection && (
                <Button
                  onClick={() => {
                    setEditingModule(null);
                    setModuleDialogOpen(true);
                  }}
                  className="bg-[#6B1B3D] hover:bg-[#4A1228]"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Module
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedSection ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`section-${selectedSection.id}`}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {modules
                        .filter((m) => m.sectionId === selectedSection.id)
                        .sort((a, b) => a.order - b.order)
                        .map((module, index) => (
                          <Draggable
                            key={module.id}
                            draggableId={`module-${module.id}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border-2 border-gray-200 rounded-xl overflow-hidden"
                              >
                                <div className="p-4 bg-white flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab"
                                  >
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">
                                        {module.title}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {module.phase}
                                      </Badge>
                                      {!module.isEnabled && (
                                        <Badge className="bg-gray-100 text-gray-600">
                                          Hidden
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        toggleModuleExpanded(module.id)
                                      }
                                    >
                                      {expandedModules.has(module.id) ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() =>
                                        toggleModuleVisibility.mutate({
                                          id: module.id,
                                          isEnabled: !module.isEnabled,
                                        })
                                      }
                                    >
                                      {module.isEnabled ? (
                                        <Eye className="w-5 h-5 text-gray-500" />
                                      ) : (
                                        <EyeOff className="w-5 h-5 text-gray-400" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingModule(module);
                                        setSelectedModule(module);
                                        setModuleDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="w-5 h-5 text-gray-500" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm("Delete this module?"))
                                          deleteModule.mutate(module.id);
                                      }}
                                    >
                                      <Trash2 className="w-5 h-5 text-red-500" />
                                    </button>
                                  </div>
                                </div>

                                {/* Pages */}
                                {expandedModules.has(module.id) && (
                                  <div className="border-t bg-gray-50 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm font-semibold text-gray-600">
                                        Pages
                                      </span>
                                      <Button
                                        onClick={() => {
                                          setSelectedModule(module);
                                          setEditingPage(null);
                                          setPageDialogOpen(true);
                                        }}
                                        size="sm"
                                        variant="outline"
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Page
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      {pages
                                        .filter((p) => p.moduleId === module.id)
                                        .sort((a, b) => a.order - b.order)
                                        .map((page) => (
                                          <div
                                            key={page.id}
                                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                          >
                                            <span className="text-sm">
                                              {page.title}
                                            </span>
                                            <div className="flex items-center gap-2">
                                              {page.requireCompletion && (
                                                <Badge className="bg-orange-100 text-orange-700 text-xs">
                                                  Required
                                                </Badge>
                                              )}
                                              <button
                                                onClick={() => {
                                                  setSelectedModule(module);
                                                  setEditingPage(page);
                                                  setPageDialogOpen(true);
                                                }}
                                              >
                                                <Edit className="w-4 h-4 text-gray-500" />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  if (
                                                    confirm("Delete this page?")
                                                  )
                                                    deletePage.mutate(page.id);
                                                }}
                                              >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a section to view its modules
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <SectionEditor
        open={sectionDialogOpen}
        onOpenChange={setSectionDialogOpen}
        section={editingSection}
      />
      <ModuleEditor
        open={moduleDialogOpen}
        onOpenChange={setModuleDialogOpen}
        module={editingModule}
        sectionId={selectedSection?.id}
      />
      <PageEditor
        open={pageDialogOpen}
        onOpenChange={setPageDialogOpen}
        page={editingPage}
        moduleId={selectedModule?.id}
      />
    </div>
  );
}