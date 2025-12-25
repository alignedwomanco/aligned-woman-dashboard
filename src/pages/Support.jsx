import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Send, CheckCircle } from "lucide-react";

const faqs = [
  {
    question: "How does the ALIVE Method work?",
    answer: "The ALIVE Method is a four-phase framework (Awareness, Liberation, Intention, Vision & Embodiment) designed to guide you through personal transformation. Your diagnostic determines which phase you need most right now.",
  },
  {
    question: "How do I unlock new modules?",
    answer: "Modules unlock based on your progress, capacity score, and completion of prerequisite modules. Your personalized pathway adapts to your journey.",
  },
  {
    question: "What is my capacity score?",
    answer: "Your capacity score (1-10) reflects how resourced you feel. It's used to personalize your daily guidance and module recommendations.",
  },
  {
    question: "How often should I check in?",
    answer: "Daily check-ins are recommended for the most accurate guidance, but you can adjust your snapshot frequency in settings.",
  },
  {
    question: "Can I change my primary phase?",
    answer: "Your phase is determined by your diagnostic and evolves with your progress. You can retake the diagnostic from Profile Settings to update your pathway.",
  },
];

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: myTickets = [] } = useQuery({
    queryKey: ["myTickets"],
    queryFn: () => base44.entities.SupportTicket.list("-created_date"),
    initialData: [],
  });

  const createTicketMutation = useMutation({
    mutationFn: () => base44.entities.SupportTicket.create({ subject, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      setSubject("");
      setMessage("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#4A1228] mb-2">Support</h1>
          <p className="text-gray-600">Get help and find answers</p>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="new">Submit Ticket</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#6B1B3D]" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {myTickets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No support tickets yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTickets.map((ticket) => (
                      <Card key={ticket.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold mb-1">{ticket.subject}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(ticket.created_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-4">{ticket.message}</p>
                          {ticket.adminResponse && (
                            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                              <p className="text-sm font-semibold text-[#6B1B3D] mb-2">
                                Support Response:
                              </p>
                              <p className="text-sm text-gray-700">{ticket.adminResponse}</p>
                              {ticket.respondedAt && (
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(ticket.respondedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Ticket Tab */}
          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Submit Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ticket Submitted</h3>
                    <p className="text-gray-600">We'll get back to you soon!</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createTicketMutation.mutate();
                    }}
                    className="space-y-6"
                  >
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>

                    <div>
                      <Label>Message</Label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your issue in detail..."
                        className="min-h-[200px]"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={createTicketMutation.isLoading}
                      className="bg-[#6B1B3D] hover:bg-[#4A1228]"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}