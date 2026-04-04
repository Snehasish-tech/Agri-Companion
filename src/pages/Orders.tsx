import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, TrendingUp, Package, Truck, CheckCircle2, Clock,
  XCircle, Eye, Calendar, MapPin, Filter, Search, Loader2, Copy, Check, Download,
  ArrowUpRight, ArrowDownLeft, BarChart3, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import PaymentDialog from "@/components/PaymentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import logo from "@/assets/logo.jpg";
import { useTranslation } from "react-i18next";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  rawId: string;
  item: string;
  category: string;
  quantity: string;
  total: number;
  date: string;
  status: OrderStatus;
  counterparty: string;
  location: string;
  trackingId?: string;
  paymentStatus?: "paid" | "pending" | "cod";
}

const statusConfig: Record<
  OrderStatus,
  { labelKey: string; icon: React.ElementType; color: string }
> = {
  pending:   { labelKey: "orders.status.pending",   icon: Clock,        color: "bg-warning/15 text-warning" },
  confirmed: { labelKey: "orders.status.confirmed", icon: CheckCircle2, color: "bg-info/15 text-info" },
  shipped:   { labelKey: "orders.status.shipped",   icon: Truck,        color: "bg-accent/15 text-accent-foreground" },
  delivered: { labelKey: "orders.status.delivered", icon: CheckCircle2, color: "bg-success/15 text-success" },
  cancelled: { labelKey: "orders.status.cancelled", icon: XCircle,      color: "bg-destructive/15 text-destructive" },
};

const paymentStatusConfig: Record<string, { labelKey: string; color: string }> = {
  paid:    { labelKey: "orders.payment.paid",   color: "bg-success/15 text-success" },
  pending: { labelKey: "orders.payment.pending", color: "bg-warning/15 text-warning" },
  cod:     { labelKey: "orders.payment.cod",    color: "bg-info/15 text-info" },
};

const progressSteps: { status: OrderStatus; labelKey: string }[] = [
  { status: "pending",   labelKey: "orders.progress.ordered"   },
  { status: "confirmed", labelKey: "orders.progress.confirmed" },
  { status: "shipped",   labelKey: "orders.progress.shipped"   },
  { status: "delivered", labelKey: "orders.progress.delivered" },
];

const mySales: Order[] = [
  { id: "SL-2048", rawId: "SL-2048", item: "Premium Basmati Rice",    category: "Grain",     quantity: "200 qtl",  total: 420000, date: "2026-02-11", status: "confirmed", counterparty: "Delhi Grain Market",     location: "New Delhi",      paymentStatus: "pending" },
  { id: "SL-2041", rawId: "SL-2041", item: "Fresh Onions (Grade A)",  category: "Vegetable", quantity: "50 qtl",   total: 87500,  date: "2026-02-08", status: "shipped",   counterparty: "Metro Fresh Pvt Ltd",    location: "Mumbai, MH",     trackingId: "TRK77234", paymentStatus: "paid" },
  { id: "SL-2055", rawId: "SL-2055", item: "Organic Turmeric Powder", category: "Spice",     quantity: "10 qtl",   total: 95000,  date: "2026-02-12", status: "pending",   counterparty: "SpiceWorld Exports",     location: "Kochi, KL",      paymentStatus: "pending" },
  { id: "SL-2033", rawId: "SL-2033", item: "Soybean (FAQ Grade)",     category: "Grain",     quantity: "100 qtl",  total: 450000, date: "2026-02-03", status: "delivered", counterparty: "Agri Commodities Ltd",   location: "Indore, MP",     paymentStatus: "paid" },
  { id: "SL-2028", rawId: "SL-2028", item: "Cotton Bales",            category: "Fiber",     quantity: "30 bales", total: 180000, date: "2026-01-25", status: "delivered", counterparty: "Textile Hub",            location: "Ahmedabad, GJ",  paymentStatus: "paid" },
];

const summaryStats = [
  { icon: ShoppingCart, labelKey: "orders.summary.totalOrders",     value: "24",     changeKey: "orders.summary.totalOrdersChange",      color: "text-info" },
  { icon: TrendingUp,   labelKey: "orders.summary.totalSales",      value: "₹12.3L", changeKey: "orders.summary.totalSalesChange",       color: "text-success" },
  { icon: Package,      labelKey: "orders.summary.activeShipments", value: "5",      changeKey: "orders.summary.activeShipmentsChange",  color: "text-warning" },
  { icon: BarChart3,    labelKey: "orders.summary.avgOrderValue",   value: "₹3,450", changeKey: "orders.summary.avgOrderValueChange",   color: "text-accent-foreground" },
];

// ─────────────────────────────────────────────────────────────────────────────
// OrderCard
// ─────────────────────────────────────────────────────────────────────────────
function OrderCard({
  order,
  type,
  onCancel,
  isCancelling,
}: {
  order: Order;
  type: "order" | "sale";
  onCancel: (order: Order) => void;
  isCancelling: boolean;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();
  const config    = statusConfig[order.status];
  const payConfig = paymentStatusConfig[order.paymentStatus || "pending"];
  const Icon      = type === "order" ? ArrowUpRight : ArrowDownLeft;
  const currentStepIdx = progressSteps.findIndex((s) => s.status === order.status);

  const copyToClipboard = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: t("orders.toast.copiedTitle", "Copied!"),
        description: t("orders.toast.copiedDescription", "Token ID copied to clipboard."),
      });
      setTimeout(() => setCopied(false), 2000);
    },
    [toast, t]
  );

  // ── INVOICE PDF ────────────────────────────────────────────────────────────
  const handleDownloadInvoice = useCallback(async () => {
    const doc = new jsPDF({ format: "a4", orientation: "portrait" });

    const PAGE_W = doc.internal.pageSize.getWidth();   // 210
    const PAGE_H = doc.internal.pageSize.getHeight();  // 297
    const ML = 18;
    const MR = 18;
    const CW = PAGE_W - ML - MR; // 174

    const GREEN_DARK  : [number,number,number] = [30,  100, 40];
    const GREEN_MID   : [number,number,number] = [46,  125, 50];
    const GREEN_LIGHT : [number,number,number] = [232, 245, 233];
    const GRAY_DARK   : [number,number,number] = [40,  40,  40];
    const GRAY_MID    : [number,number,number] = [100, 100, 100];
    const GRAY_LIGHT  : [number,number,number] = [245, 245, 245];
    const WHITE       : [number,number,number] = [255, 255, 255];

    // ── HEADER BAND ─────────────────────────────────────────────
    doc.setFillColor(...GREEN_MID);
    doc.rect(0, 0, PAGE_W, 48, "F");

    // Render real logo image in header; fallback to KG badge if loading fails.
    let logoRendered = false;
    try {
      if (logo) {
        const logoResponse = await fetch(logo);
        const logoBlob = await logoResponse.blob();
        const logoDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Logo conversion failed"));
          reader.readAsDataURL(logoBlob);
        });

        doc.addImage(logoDataUrl, "JPEG", ML, 16, 16, 16);
        logoRendered = true;
      }
    } catch {
      logoRendered = false;
    }

    if (!logoRendered) {
      doc.setFillColor(...GREEN_DARK);
      doc.circle(ML + 8, 24, 8, "F");
      doc.setTextColor(...WHITE);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("KG", ML + 5.2, 25.5);
    }

    // Company name + tagline
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text("KrishiGrowAI", ML + 20, 20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Mandi-to-Market Platform for Farmers", ML + 20, 27);
    doc.text("support@krishigrowai.in  |  www.krishigrowai.in", ML + 20, 33);

    // INVOICE label — right side of header
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text("INVOICE", PAGE_W - MR, 22, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      type === "order" ? "PURCHASE INVOICE" : "SALES INVOICE",
      PAGE_W - MR, 30, { align: "right" }
    );

    // ── TWO-COLUMN INFO SECTION ──────────────────────────────────
    // Left: invoice details   |   Right: party details
    // Each column has its own Y tracker — they never share yPos
    let LY = 58; // left column Y
    let RY = 58; // right column Y
    const RX = PAGE_W / 2 + 5; // right column X start

    // Left heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_DARK);
    doc.text("INVOICE DETAILS", ML, LY);
    LY += 5;

    const invoiceDetails: [string, string][] = [
      ["Invoice No.",    order.id],
      ["Date",           order.date],
      ["Order Status",   order.status.charAt(0).toUpperCase() + order.status.slice(1)],
      ["Payment Status", (order.paymentStatus || "pending").charAt(0).toUpperCase() + (order.paymentStatus || "pending").slice(1)],
    ];

    invoiceDetails.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_MID);
      doc.text(label + ":", ML, LY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GRAY_DARK);
      doc.text(value, ML + 38, LY);
      LY += 5.5;
    });

    // Right heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_DARK);
    doc.text(type === "order" ? "SELLER DETAILS" : "BUYER DETAILS", RX, RY);
    RY += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_DARK);
    const partyLines = doc.splitTextToSize(order.counterparty, CW / 2 - 5) as string[];
    partyLines.forEach((line) => {
      doc.text(line, RX, RY);
      RY += 5;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_MID);
    doc.text("Location : " + order.location, RX, RY); RY += 5;
    doc.text("Platform : KrishiGrow Marketplace", RX, RY); RY += 5;

    // ── HORIZONTAL DIVIDER ───────────────────────────────────────
    let Y = Math.max(LY, RY) + 6;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(ML, Y, PAGE_W - MR, Y);
    Y += 8;

    // ── ITEMS TABLE ──────────────────────────────────────────────
    // Column X positions
    const C_DESC  = ML;
    const C_CAT   = ML + 72;
    const C_QTY   = ML + 108;
    const C_NET   = ML + 130;
    const C_TOTAL = ML + 155;

    // Table header row
    doc.setFillColor(...GREEN_MID);
    doc.rect(ML, Y, CW, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...WHITE);
    doc.text("Description",  C_DESC  + 2, Y + 5.5);
    doc.text("Category",     C_CAT   + 2, Y + 5.5);
    doc.text("Qty",          C_QTY   + 2, Y + 5.5);
    doc.text("Net Amt",      C_NET   + 2, Y + 5.5);
    doc.text("Total (INR)",  C_TOTAL + 2, Y + 5.5);
    Y += 10;

    // Single data row
    const GST_RATE  = 0.05;
    const taxableAmt = order.total / (1 + GST_RATE);
    const gstAmt     = order.total - taxableAmt;

    // Alternating row background
    doc.setFillColor(...GREEN_LIGHT);
    doc.rect(ML, Y - 1, CW, 12, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_DARK);

    const descLines = doc.splitTextToSize(order.item, 66) as string[];
    descLines.forEach((line, i) => {
      doc.text(line, C_DESC + 2, Y + 4 + i * 4.5);
    });
    const rowH = Math.max(12, descLines.length * 4.5 + 5);

    doc.text(order.category, C_CAT  + 2, Y + 6);
    doc.text(order.quantity,  C_QTY  + 2, Y + 6);
    doc.text(
      "Rs." + taxableAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      C_NET + 2, Y + 6
    );
    doc.text(
      "Rs." + taxableAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      C_TOTAL + 2, Y + 6
    );
    Y += rowH + 4;

    // Table bottom border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(ML, Y, PAGE_W - MR, Y);
    Y += 8;

    // ── TOTALS BLOCK (right-aligned) ─────────────────────────────
    const TX = PAGE_W - MR - 82; // label start X
    const VX = PAGE_W - MR;      // value right-edge X

    const drawRow = (
      label: string,
      value: string,
      bold  = false,
      big   = false,
      color: [number,number,number] = GRAY_DARK
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(big ? 10.5 : 8.5);
      doc.setTextColor(...color);
      doc.text(label, TX,  Y);
      doc.text(value, VX,  Y, { align: "right" });
      Y += big ? 8 : 6;
    };

    drawRow(
      "Subtotal (excl. GST) :",
      "Rs." + taxableAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })
    );
    drawRow(
      "GST @ 5% :",
      "Rs." + gstAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })
    );

    // Separator above grand total
    doc.setDrawColor(...GREEN_MID);
    doc.setLineWidth(0.5);
    doc.line(TX, Y - 1, PAGE_W - MR, Y - 1);
    Y += 2;

    // Grand total highlight band
    doc.setFillColor(...GREEN_LIGHT);
    doc.rect(TX - 3, Y - 3, PAGE_W - MR - TX + 5, 11, "F");
    drawRow(
      "TOTAL AMOUNT :",
      "Rs." + order.total.toLocaleString("en-IN"),
      true, true, GREEN_DARK
    );

    Y += 4;

    // ── SECTION DIVIDER ──────────────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(ML, Y, PAGE_W - MR, Y);
    Y += 7;

    // ── PAYMENT INFO + TERMS (two columns) ───────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_DARK);
    doc.text("PAYMENT INFORMATION", ML, Y);
    doc.text("TERMS & CONDITIONS",  RX, Y);
    Y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_MID);

    const payLines: string[] = [
      "Status  : " + (order.paymentStatus || "pending").toUpperCase(),
      "Method  : As per agreed terms",
      "Ref     : Quote Invoice No. in payment",
    ];

    const termLines: string[] = [
      "1. Invoice valid for 30 days from issue date.",
      "2. Goods remain property of KrishiGrowAI",
      "   until full payment is received.",
      "3. Disputes subject to Indian jurisdiction.",
      "4. This invoice is valid without seller signature.",
    ];

    const maxRows = Math.max(payLines.length, termLines.length);
    for (let i = 0; i < maxRows; i++) {
      if (payLines[i])  doc.text(payLines[i],  ML, Y + i * 5);
      if (termLines[i]) doc.text(termLines[i], RX, Y + i * 5);
    }
    Y += maxRows * 5 + 8;

    // ── TRACKING ID (if present) ─────────────────────────────────
    if (order.trackingId) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(ML, Y, PAGE_W - MR, Y);
      Y += 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_DARK);
      doc.text("Tracking ID :", ML, Y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_MID);
      doc.text(order.trackingId, ML + 32, Y);
      Y += 8;
    }

    // ── SELLER SIGNATURE SECTION ─────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(ML, Y, PAGE_W - MR, Y);
    Y += 8;

    // Split into two signature areas
    const sigColX = PAGE_W / 2;
    const sigLabelY = Y;
    const sigLineY = Y + 20;

    // Left: Buyer signature
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_DARK);
    doc.text("Buyer Signature", ML, sigLabelY);
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.4);
    doc.line(ML, sigLineY, sigColX - 5, sigLineY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY_MID);
    doc.text("Date: ________________", ML, sigLineY + 5);

    // Right: Seller signature (AUTHORIZED SELLER SIGNATURE)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_DARK);
    doc.text("Authorized Seller Signature", sigColX + 5, sigLabelY);
    doc.text("(Seal of Market Owner)", sigColX + 5, sigLabelY + 4);
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.4);
    doc.line(sigColX + 5, sigLineY, PAGE_W - MR, sigLineY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY_MID);
    doc.text("Date: ________________", sigColX + 5, sigLineY + 5);

    Y = sigLineY + 12;

    // ── FOOTER BAND ──────────────────────────────────────────────
    doc.setFillColor(...GRAY_LIGHT);
    doc.rect(0, PAGE_H - 22, PAGE_W, 22, "F");

    doc.setDrawColor(...GREEN_MID);
    doc.setLineWidth(0.8);
    doc.line(0, PAGE_H - 22, PAGE_W, PAGE_H - 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREEN_DARK);
    doc.text("KrishiGrowAI", ML, PAGE_H - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY_MID);
    doc.text(
      "Thank you for your order. This invoice is valid with or without seller signature.",
      PAGE_W / 2, PAGE_H - 14, { align: "center" }
    );
    doc.text(
      "Generated: " + new Date().toLocaleString("en-IN"),
      PAGE_W - MR, PAGE_H - 14, { align: "right" }
    );

    doc.setTextColor(160, 160, 160);
    doc.setFontSize(6.5);
    doc.text(
      "KrishiGrowAI  |  support@krishigrowai.in  |  www.krishigrowai.in",
      PAGE_W / 2, PAGE_H - 8, { align: "center" }
    );

    doc.save(`Invoice_${order.id}_${Date.now()}.pdf`);

    toast({
      title: "✅ Invoice Generated Successfully",
      description: `Professional invoice for ${order.id} is ready for download.`,
    });
  }, [order, type, toast]);
  // ── END INVOICE PDF ────────────────────────────────────────────

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "glass-card-hover rounded-xl p-5 group transition-all duration-300 relative overflow-hidden",
          order.status === "cancelled"
            ? "border-red-500/40 bg-red-500/[0.03] grayscale-[0.3]"
            : ""
        )}
      >
        {order.status === "cancelled" && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none bg-red-600/5 backdrop-blur-[1px]">
            <div className="border-[8px] border-red-600/20 text-red-600/20 px-10 py-4 rounded-3xl rotate-[-15deg] font-heading font-black text-6xl uppercase tracking-[0.3em] select-none whitespace-nowrap shadow-inner">
              {t("orders.status.cancelled", "Cancelled")}
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                type === "order" ? "bg-info/10" : "bg-success/10"
              }`}
            >
              <Icon className={`w-5 h-5 ${type === "order" ? "text-info" : "text-success"}`} />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold text-foreground text-sm truncate">
                {order.item}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{order.counterparty}</p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {order.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {order.location}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 space-y-1.5">
            <p className="font-mono font-bold text-foreground text-sm">
              ₹{order.total.toLocaleString("en-IN")}
            </p>
            <div className="flex flex-col items-end gap-1">
              <Badge className={`${config.color} border-0 text-[11px]`}>
                <config.icon className="w-3 h-3 mr-1" />
                {t(config.labelKey, "Status")}
              </Badge>
              <Badge className={`${payConfig.color} border-0 text-[10px]`}>
                <CreditCard className="w-2.5 h-2.5 mr-0.5" />
                {t(payConfig.labelKey, "Payment")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(order.id);
              }}
              className="p-1 hover:bg-muted rounded-md transition-all opacity-0 group-hover:opacity-100"
              title={t("orders.actions.copyTokenId", "Copy Token ID")}
            >
              {copied ? (
                <Check className="w-3 h-3 text-success" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
            <span className="text-xs text-muted-foreground font-mono">· {order.quantity}</span>
          </div>
          <div className="flex gap-2">
            {order.paymentStatus === "pending" && order.status !== "cancelled" && (
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs gradient-warm text-secondary-foreground border-0"
                onClick={() => setPaymentOpen(true)}
              >
                <CreditCard className="w-3 h-3 mr-1" /> {t("orders.actions.payNow", "Pay Now")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="w-3 h-3 mr-1" /> {t("orders.actions.details", "Details")}
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {t(type === "order" ? "orders.labels.orderDetails" : "orders.labels.saleDetails", type === "order" ? "Order Details" : "Sale Details")}
            </DialogTitle>
            <DialogDescription>
              {t(
                type === "order"
                  ? "orders.labels.orderDescription"
                  : "orders.labels.saleDescription",
                type === "order"
                  ? "View complete details about your order including status, items, and payment information."
                  : "View complete details about your sale including status, items, and payment information."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Progress Stepper */}
            {order.status !== "cancelled" && currentStepIdx !== -1 && (
              <div className="relative flex justify-between items-center py-4 mb-4">
                <div className="absolute top-[34px] left-[18px] right-[18px] h-0.5 bg-muted z-0">
                  <div
                    className="h-full bg-primary transition-all duration-700 ease-in-out"
                    style={{
                      width: `${(currentStepIdx / (progressSteps.length - 1)) * 100}%`,
                    }}
                  />
                </div>
                {progressSteps.map((step, idx) => {
                  const isActive  = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const StepIcon  = statusConfig[step.status].icon;

                  return (
                    <div key={step.labelKey} className="relative z-10 flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                          isActive
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "bg-background border-muted text-muted-foreground"
                        )}
                      >
                        {idx < currentStepIdx ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-medium transition-colors duration-300",
                          isCurrent ? "text-foreground font-bold" : "text-muted-foreground"
                        )}
                      >
                        {t(step.labelKey, "")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 text-sm">
              {(
                [
                  { key: "orders.fields.id", value: order.id, isCopyable: true },
                  { key: "orders.fields.item", value: order.item },
                  { key: "orders.fields.category", value: order.category },
                  { key: "orders.fields.quantity", value: order.quantity },
                  { key: type === "order" ? "orders.fields.seller" : "orders.fields.buyer", value: order.counterparty },
                  { key: "orders.fields.location", value: order.location },
                  { key: "orders.fields.date", value: order.date },
                  ...(order.trackingId ? [{ key: "orders.fields.trackingId", value: order.trackingId }] : []),
                ] as { key: string; value: string; isCopyable?: boolean }[]
              ).map((field) => (
                <div key={field.key} className="flex justify-between items-center group/row">
                  <span className="text-muted-foreground">{t(field.key, field.key)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{field.value}</span>
                    {field.isCopyable && (
                      <button
                        onClick={() => copyToClipboard(order.id)}
                        className="p-1 hover:bg-muted rounded-md transition-all opacity-0 group-hover/row:opacity-100"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-muted rounded-lg p-3">
              <span className="text-sm text-muted-foreground">{t("orders.labels.totalAmount", "Total Amount")}</span>
              <span className="font-mono font-bold text-lg text-foreground">
                ₹{order.total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex gap-2">
              <Badge className={`${config.color} border-0 w-fit`}>
                <config.icon className="w-3 h-3 mr-1" /> {t(config.labelKey, "Status")}
              </Badge>
              <Badge className={`${payConfig.color} border-0 w-fit`}>
                <CreditCard className="w-3 h-3 mr-1" /> {t(payConfig.labelKey, "Payment")}
              </Badge>
            </div>

            <Button variant="outline" className="w-full" onClick={handleDownloadInvoice}>
              <Download className="w-4 h-4 mr-2" /> {t("orders.actions.downloadInvoice", "Download Invoice")}
            </Button>

            {(order.status === "pending" || order.status === "confirmed") && (
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isCancelling}
                onClick={() => {
                  onCancel(order);
                  setDetailOpen(false);
                }}
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {t("orders.actions.cancelOrder", "Cancel Order")}
              </Button>
            )}

            {order.trackingId && order.status !== "cancelled" && (
              <Button
                variant="outline"
                className="w-full border-2"
                onClick={() =>
                  window.open(
                    `https://www.google.com/search?q=track+package+${order.trackingId}`,
                    "_blank"
                  )
                }
              >
                <Truck className="w-4 h-4 mr-2" /> {t("orders.actions.trackShipment", "Track Shipment")}
              </Button>
            )}

            {order.paymentStatus === "pending" && order.status !== "cancelled" && (
              <Button
                className="w-full gradient-warm text-secondary-foreground border-0"
                onClick={() => {
                  setDetailOpen(false);
                  setPaymentOpen(true);
                }}
              >
                <CreditCard className="w-4 h-4 mr-2" /> {t("orders.actions.pay", "Pay")} ₹
                {order.total.toLocaleString("en-IN")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {order.paymentStatus === "pending" && order.status !== "cancelled" && (
        <PaymentDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          amount={order.total}
          description={t(
            type === "order" ? "orders.labels.paymentDescriptionOrder" : "orders.labels.paymentDescriptionSale",
            `${type === "order" ? "Order" : "Sale"} {{id}} - {{item}}`,
            { id: order.id, item: order.item }
          )}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Orders() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sb = supabase as any;
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab]     = useState("orders");

  const cancelOrderMutation = useMutation({
    mutationFn: async (order: Order) => {
      const localKey    = `local_orders_${user?.id}`;
      const localOrders = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updatedLocalOrders = localOrders.map((o: { id: string; status: string }) =>
        o.id === order.rawId ? { ...o, status: "cancelled" } : o
      );
      localStorage.setItem(localKey, JSON.stringify(updatedLocalOrders));

      if (!order.rawId.startsWith("SL-")) {
        try {
          await sb
            .from("marketplace_orders")
            .update({ status: "cancelled" })
            .eq("id", order.rawId);
        } catch {
          console.warn("DB sync skipped - using local data only");
        }
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOrders", user?.id] });
      toast({
        title: t("orders.toast.cancelledTitle", "Order Cancelled"),
        description: t("orders.toast.cancelledDescription", "Your order has been cancelled successfully."),
      });
    },
    onError: (err: Error) => {
      toast({
        title: t("orders.toast.cancelFailedTitle", "Cancellation Failed"),
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleCancelOrder = useCallback(
    (order: Order) => { cancelOrderMutation.mutate(order); },
    [cancelOrderMutation]
  );

  const { data: fetchedOrders = [], isLoading } = useQuery({
    queryKey: ["myOrders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const localKey    = `local_orders_${user.id}`;
      const localOrders: Record<string, unknown>[] = JSON.parse(
        localStorage.getItem(localKey) || "[]"
      );

      let dbOrders: Record<string, unknown>[] = [];
      try {
        const { data, error } = await sb
          .from("marketplace_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) dbOrders = data;
        if (error && error.code !== "PGRST116") {
          console.warn("Database fetch error:", error.message);
        }
      } catch (err) {
        console.warn("Could not fetch from Supabase table. Using local data.", err);
      }

      const combined = [...localOrders, ...dbOrders];

      return combined.map((o) => {
        const safeId =
          typeof o.id === "string" ? o.id : String(o.id || Math.random());
        const items = (o.items as Array<{ name?: string; qty?: number }>) || [];
        return {
          id: safeId.startsWith("ORD-") ? safeId : safeId.slice(0, 8).toUpperCase(),
          rawId: safeId,
          item:
            (items[0]?.name || t("orders.defaults.agriculturalItem", "Agricultural Item")) +
            (items.length > 1
              ? t("orders.defaults.moreItemsSuffix", " (+{{count}} more)", { count: items.length - 1 })
              : ""),
          category:      t("orders.defaults.marketplace", "Marketplace"),
          quantity:      (items[0]?.qty || 1) + " units",
          total:         (o.total_price as number) || 0,
          date:          o.created_at
            ? new Date(o.created_at as string).toLocaleDateString()
            : new Date().toLocaleDateString(),
          status:        (o.status as OrderStatus) || "pending",
          counterparty:  t("orders.defaults.counterparty", "KrishiGrow Marketplace"),
          location:      (o.shipping_address as string) || t("orders.defaults.defaultAddress", "Default Address"),
          paymentStatus: (o.payment_status as "paid" | "pending" | "cod") || "pending",
          trackingId:    o.tracking_id as string | undefined,
        } as Order;
      });
    },
    enabled: !!user,
  });

  const filteredOrdersData = useMemo(
    () =>
      (activeTab === "orders" ? fetchedOrders : mySales).filter((o) => {
        const matchesSearch =
          (o.item?.toLowerCase()        || "").includes(search.toLowerCase()) ||
          (o.id?.toUpperCase()          || "").includes(search.toUpperCase()) ||
          (o.counterparty?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [fetchedOrders, search, statusFilter, activeTab]
  );

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-heading font-bold text-foreground"
        >
          {t("orders.title", "Orders & Sales")}
        </motion.h1>
        <p className="text-muted-foreground mt-1">{t("orders.subtitle", "Track your purchases and manage your sales")}</p>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {summaryStats.map((s) => (
          <div
            key={s.labelKey}
            className="glass-card rounded-xl p-4 hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="font-mono font-bold text-xl text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{t(s.labelKey, "")}</div>
            <div className="text-[11px] text-success mt-1">{t(s.changeKey, "")}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("orders.searchPlaceholder", "Search by Item, Counterparty or Token ID...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={t("orders.statusPlaceholder", "Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("orders.filters.allStatuses", "All Statuses")}</SelectItem>
            <SelectItem value="pending">{t("orders.status.pending", "Pending")}</SelectItem>
            <SelectItem value="confirmed">{t("orders.status.confirmed", "Confirmed")}</SelectItem>
            <SelectItem value="shipped">{t("orders.status.shipped", "Shipped")}</SelectItem>
            <SelectItem value="delivered">{t("orders.status.delivered", "Delivered")}</SelectItem>
            <SelectItem value="cancelled">{t("orders.status.cancelled", "Cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="orders" onValueChange={setActiveTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="orders" className="gap-1.5">
            <ShoppingCart className="w-4 h-4" /> {t("orders.tabs.myOrders", "My Orders")}
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5">
            <TrendingUp className="w-4 h-4" /> {t("orders.tabs.sellingItems", "Selling Items")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">{t("orders.loading", "Fetching your orders...")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredOrdersData.map((order) => (
                  <OrderCard
                    key={order.rawId}
                    order={order}
                    type="order"
                    onCancel={handleCancelOrder}
                    isCancelling={
                      cancelOrderMutation.isPending &&
                      cancelOrderMutation.variables?.rawId === order.rawId
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
          {!isLoading && filteredOrdersData.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">{t("orders.empty.orders", "No orders found")}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="mt-5">
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredOrdersData.map((order) => (
                <OrderCard
                  key={order.rawId}
                  order={order}
                  type="sale"
                  onCancel={handleCancelOrder}
                  isCancelling={
                    cancelOrderMutation.isPending &&
                    cancelOrderMutation.variables?.rawId === order.rawId
                  }
                />
              ))}
            </AnimatePresence>
          </div>
          {filteredOrdersData.length === 0 && (
            <div className="text-center py-16">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">{t("orders.empty.sales", "No sales found")}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}