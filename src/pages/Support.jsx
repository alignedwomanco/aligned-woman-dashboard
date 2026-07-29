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

// Platform wide FAQs, grouped. Kept accurate to what actually exists:
// the previous set described a four phase ALIVE Method (it is five), a
// capacity score that gates module unlocking (nothing gates on capacity),
// and daily check ins driving module recommendations. Answering questions
// with features that do not exist creates support tickets rather than
// preventing them.
const faqs = [
  // ── Getting started ──
  {
    category: "Getting started",
    question: "What is The Aligned Woman Co?",
    answer:
      "A learning platform for women, built around The Aligned Woman Blueprint, a directory of credentialed practitioners, and a community where you can ask questions and join live sessions. You can use any part of it on its own.",
  },
  {
    category: "Getting started",
    question: "Do I have to buy anything to use it?",
    answer:
      "No. Registering is free, and it gives you the Directory, the Community, The Pattern and the free resources. The Blueprint is the one thing you buy.",
  },
  {
    category: "Getting started",
    question: "What is The Pattern?",
    answer:
      "A short set of honest questions that shows you which of five patterns has been running the show: The Performer, The Over-Functioner, The Delegator, The Overrider or The Reactor. It is free, it takes a few minutes, and you can retake it whenever you like from your dashboard.",
  },

  // ── The Blueprint ──
  {
    category: "The Blueprint",
    question: "What is the ALIVE Method?",
    answer:
      "The five phases The Blueprint moves through: Awareness, Liberation, Intention, Vision and Embodiment. You work through them in order, and each phase holds several modules taught by a different expert.",
  },
  {
    category: "The Blueprint",
    question: "How do modules unlock?",
    answer:
      "You move through The Blueprint in order. Mark each lesson complete as you finish it and the next one opens. Nothing is locked behind a score or a streak, and nothing expires, so you can take as long as you need.",
  },
  {
    category: "The Blueprint",
    question: "How long do I have access?",
    answer:
      "Your access does not expire. Come back to any lesson or workbook whenever you want, as often as you want.",
  },
  {
    category: "The Blueprint",
    question: "What are the workbooks?",
    answer:
      "Companion workbooks that sit alongside the modules. Your answers save as you go, so you can close the tab and pick it up later. You will find them in the Classroom next to the module they belong to.",
  },
  {
    category: "The Blueprint",
    question: "A video will not play. What do I do?",
    answer:
      "Try a different browser first, Safari or Chrome, and check you are not on a very slow connection. If it still will not play, send us a ticket with the module and lesson name and we will fix it.",
  },

  // ── The Directory ──
  {
    category: "The Directory",
    question: "What does AW Verified mean?",
    answer:
      "Every practitioner in the Directory has had their credentials checked by us before being listed. Qualifications, proof, and a real conversation. We do not list influencers, and being listed cannot be bought.",
  },
  {
    category: "The Directory",
    question: "How do I find the right practitioner?",
    answer:
      "Filter by specialty first, then by how you want to meet, online or in person, then by location. If nothing comes back, widen the location before you widen the specialty. The specialty is usually the thing that matters.",
  },
  {
    category: "The Directory",
    question: "Does contacting a practitioner cost anything?",
    answer:
      "No. Sending a message through her profile is free. Anything you arrange with her after that is between the two of you, at her rates.",
  },
  {
    category: "The Directory",
    question: "I am a practitioner. How do I apply?",
    answer:
      "There is an Apply link at the bottom of the Directory. Every application is read personally. Applying does not give you access to any course, it is a request to be listed.",
  },

  // ── Community ──
  {
    category: "Community",
    question: "What is the Community?",
    answer:
      "Groups where you can ask questions and hear from practitioners directly. Hormone Health is the first, and it is open to every registered member at no cost. More are opening as practitioners come on board.",
  },
  {
    category: "Community",
    question: "What happens in a live session?",
    answer:
      "A practitioner goes live and answers questions for an hour. You can send your question in beforehand and vote on the ones you most want covered. You are never on camera, and the recording stays on the page afterwards.",
  },
  {
    category: "Community",
    question: "Is the Community medical advice?",
    answer:
      "No. It is information and connection. Nothing said in a group or a live session replaces a consultation with your own doctor, and no practitioner there is treating you.",
  },
  {
    category: "Community",
    question: "Someone has posted something upsetting. What do I do?",
    answer:
      "Use Report on the post. It comes to us, not to the group, and the person is never told who reported them. If you are worried about someone's safety, report it and send us a ticket as well so we see it faster.",
  },

  // ── Account and payment ──
  {
    category: "Account and payment",
    question: "How do I change my details or password?",
    answer:
      "Everything lives in My Profile. If you are locked out entirely, use the reset link on the sign in page.",
  },
  {
    category: "Account and payment",
    question: "How do payments work?",
    answer:
      "All payments go through Stripe. We never see or store your card details. Your receipt arrives by email as soon as the payment clears.",
  },
  {
    category: "Account and payment",
    question: "Can I get a refund?",
    answer:
      "Send us a ticket and tell us what happened. We would rather hear from you than have you sit with something that is not working.",
  },
  {
    category: "Account and payment",
    question: "How do I delete my account?",
    answer:
      "Send us a ticket and we will remove your account and your data. Tell us if you want your workbook answers sent to you first.",
  },
];

// Preserves the order the questions are written in above.
const faqCategories = faqs.reduce((acc, f) => {
  if (!acc.includes(f.category)) acc.push(f.category);
  return acc;
}, []);

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
                {/* Grouped rather than a flat list. Twenty questions in one
                    run is a wall; five groups of four is scannable. */}
                {faqCategories.map((category) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <p className="font-body text-[10.5px] font-bold uppercase tracking-[0.18em] text-awrose-deep mb-1">
                      {category}
                    </p>
                    <Accordion type="single" collapsible>
                      {faqs
                        .filter((f) => f.category === category)
                        .map((faq) => (
                          <AccordionItem key={faq.question} value={faq.question}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  </div>
                ))}
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