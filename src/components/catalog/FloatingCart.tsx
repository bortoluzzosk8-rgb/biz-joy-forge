import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const FloatingCart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, cartTotal } = useCart();
  const [cartExpanded, setCartExpanded] = useState(false);

  if (cart.length === 0) return null;

  return (
    <Card className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-64 md:w-80 shadow-2xl border-2 border-primary/30 overflow-hidden z-50 animate-scale-in">
      <div 
        className="gradient-primary p-3 md:p-4 cursor-pointer transition-all duration-300 hover:opacity-90"
        onClick={() => setCartExpanded(!cartExpanded)}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              <Badge className="absolute -top-2 -right-2 bg-secondary text-white border-0 w-4 h-4 md:w-5 md:h-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse">
                {cart.length}
              </Badge>
            </div>
            <div>
              <p className="font-bold text-base md:text-lg">Meu Carrinho</p>
              <p className="text-xs text-white/80">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg md:text-2xl font-black">{formatCurrency(cartTotal())}</p>
          </div>
        </div>
      </div>
      
      {cartExpanded && (
        <div className="p-4 bg-card max-h-64 overflow-y-auto animate-fade-in">
          <div className="space-y-3">
            {cart.map((item) => (
              <div 
                key={item.product.id} 
                className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity}x {formatCurrency(item.product.sale_price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-primary whitespace-nowrap">
                    {formatCurrency(item.product.sale_price * item.quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.product.id);
                      toast.success(`${item.product.name} removido`);
                    }}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-3 md:p-4 bg-card border-t">
        <Button 
          onClick={() => navigate("/checkout")} 
          className="w-full gradient-success text-white font-bold text-sm md:text-lg py-3 md:py-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 border-0"
        >
          <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Finalizar Compra
        </Button>
      </div>
    </Card>
  );
};
