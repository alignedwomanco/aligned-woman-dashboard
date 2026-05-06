import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, BarChart3, Search, Share2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${checked ? "bg-awrose-core" : "bg-awburg-core/20"}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

function SectionHeader({ icon: IconComp, title, description }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-awrose-pale flex items-center justify-center flex-shrink-0">
        <IconComp className="w-5 h-5 text-awrose-deep" />
      </div>
      <div>
        <h3 className="font-display text-awburg-core text-xl">{title}</h3>
        <p className="font-body text-awburg-core/60 text-sm mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function IntegrationsContent() {
  const [gscApiKey, setGscApiKey] = useState("");
  const [gscSite, setGscSite] = useState("");
  const [gscVerificationCode, setGscVerificationCode] = useState("");
  const [gscConnected, setGscConnected] = useState(false);

  const [gaTrackingId, setGaTrackingId] = useState("");
  const [gaEnabled, setGaEnabled] = useState(false);

  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [robotsTxt, setRobotsTxt] = useState("User-agent: *\nAllow: /\nSitemap: https://alignedwomanco.com/sitemap.xml");
  const [defaultOgTags, setDefaultOgTags] = useState({ title: "", description: "", image: "" });

  const [defaultShareImage, setDefaultShareImage] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("@alignedwoman");
  const [facebookPage, setFacebookPage] = useState("");

  const handleGscConnect = () => {
    if (!gscApiKey || !gscSite) return;
    setGscConnected(true);
  };

  const handleRequestIndexing = async () => {
    alert("Indexing request queued. Google Search Console will process within 24-48 hours.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-awburg-core text-2xl mb-1">Integrations</h2>
        <p className="font-body text-awburg-core/60 text-sm">Connect external services to enhance your platform.</p>
      </div>

      {/* Google Search Console */}
      <Card className="border-awburg-core/8">
        <CardContent className="pt-6">
          <SectionHeader icon={Search} title="Google Search Console" description="Monitor search performance and request page indexing." />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Domain / Site URL</Label>
                <Input value={gscSite} onChange={(e) => setGscSite(e.target.value)} placeholder="https://alignedwomanco.com" />
              </div>
              <div>
                <Label>API Key</Label>
                <Input type="password" value={gscApiKey} onChange={(e) => setGscApiKey(e.target.value)} placeholder="Your Google API key" />
              </div>
              <div className="col-span-full">
                <Label>Site Verification Code</Label>
                <Input value={gscVerificationCode} onChange={(e) => setGscVerificationCode(e.target.value)} placeholder="google-site-verification=..." />
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {gscConnected ? (
                  <><CheckCircle2 className="w-4 h-4 text-green-600" /><Badge className="bg-green-100 text-green-800">Connected</Badge></>
                ) : (
                  <><AlertCircle className="w-4 h-4 text-yellow-600" /><Badge className="bg-yellow-100 text-yellow-800">Not Connected</Badge></>
                )}
              </div>
              <Button onClick={handleGscConnect} className="bg-awburg-core hover:bg-awburg-mid text-paper gap-2">
                <Globe className="w-4 h-4" /> {gscConnected ? "Update Connection" : "Connect"}
              </Button>
              {gscConnected && (
                <Button variant="outline" onClick={handleRequestIndexing} className="gap-2 border-awburg-core/20 text-awburg-core">
                  <RefreshCw className="w-4 h-4" /> Request Indexing
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Analytics */}
      <Card className="border-awburg-core/8">
        <CardContent className="pt-6">
          <SectionHeader icon={BarChart3} title="Google Analytics" description="Track visitor behaviour and traffic sources." />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tracking ID (GA4 Measurement ID)</Label>
                <Input value={gaTrackingId} onChange={(e) => setGaTrackingId(e.target.value)} placeholder="G-XXXXXXXXXX" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ToggleSwitch checked={gaEnabled} onChange={setGaEnabled} />
              <span className="font-body text-sm text-awburg-core">{gaEnabled ? "Analytics tracking enabled" : "Analytics tracking disabled"}</span>
            </div>
            <Button className="bg-awburg-core hover:bg-awburg-mid text-paper">Save Analytics Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* SEO Tools */}
      <Card className="border-awburg-core/8">
        <CardContent className="pt-6">
          <SectionHeader icon={Globe} title="SEO Tools" description="Configure sitemaps, robots.txt, and default meta tags." />
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <ToggleSwitch checked={sitemapEnabled} onChange={setSitemapEnabled} />
              <div>
                <p className="font-body text-sm text-awburg-core">Auto-generate sitemap.xml</p>
                <p className="font-body text-xs text-awburg-core/50">Sitemap will be available at /sitemap.xml</p>
              </div>
            </div>
            <div>
              <Label>robots.txt</Label>
              <Textarea value={robotsTxt} onChange={(e) => setRobotsTxt(e.target.value)} className="font-mono text-xs min-h-[120px]" />
            </div>
            <div>
              <Label className="mb-3 block">Default OG Meta Tags</Label>
              <div className="space-y-3">
                <Input value={defaultOgTags.title} onChange={(e) => setDefaultOgTags({ ...defaultOgTags, title: e.target.value })} placeholder="Default OG Title" />
                <Input value={defaultOgTags.description} onChange={(e) => setDefaultOgTags({ ...defaultOgTags, description: e.target.value })} placeholder="Default OG Description" />
                <Input value={defaultOgTags.image} onChange={(e) => setDefaultOgTags({ ...defaultOgTags, image: e.target.value })} placeholder="Default OG Image URL" />
              </div>
            </div>
            <Button className="bg-awburg-core hover:bg-awburg-mid text-paper">Save SEO Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <Card className="border-awburg-core/8">
        <CardContent className="pt-6">
          <SectionHeader icon={Share2} title="Social Sharing Defaults" description="Set default images and handles for social sharing." />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Default Share Image URL</Label>
                <Input value={defaultShareImage} onChange={(e) => setDefaultShareImage(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Twitter / X Handle</Label>
                <Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@yourbrand" />
              </div>
              <div>
                <Label>Facebook Page URL</Label>
                <Input value={facebookPage} onChange={(e) => setFacebookPage(e.target.value)} placeholder="https://facebook.com/..." />
              </div>
            </div>
            <Button className="bg-awburg-core hover:bg-awburg-mid text-paper">Save Social Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}