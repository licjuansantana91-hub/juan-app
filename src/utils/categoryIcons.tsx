import React from 'react';
import {
  Home,
  Utensils,
  Car,
  Film,
  HeartPulse,
  Tv,
  GraduationCap,
  ShoppingBag,
  Layers,
  Briefcase,
  Laptop,
  TrendingUp,
  Coins,
  Coffee,
  Dumbbell,
  Plane,
  Wifi,
  Zap,
  ShieldCheck,
  Gift,
  Smartphone,
  PiggyBank,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

export interface AvailableIcon {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const AVAILABLE_ICONS: AvailableIcon[] = [
  { id: 'Home', label: 'Vivienda', icon: Home },
  { id: 'Utensils', label: 'Comida / Super', icon: Utensils },
  { id: 'Car', label: 'Transporte / Auto', icon: Car },
  { id: 'Film', label: 'Ocio / Cine', icon: Film },
  { id: 'HeartPulse', label: 'Salud / Farmacia', icon: HeartPulse },
  { id: 'Tv', label: 'Streaming / TV', icon: Tv },
  { id: 'GraduationCap', label: 'Educación', icon: GraduationCap },
  { id: 'ShoppingBag', label: 'Compras / Ropa', icon: ShoppingBag },
  { id: 'Briefcase', label: 'Empleo / Nómina', icon: Briefcase },
  { id: 'Laptop', label: 'Freelance / Tech', icon: Laptop },
  { id: 'TrendingUp', label: 'Inversiones', icon: TrendingUp },
  { id: 'Coins', label: 'Ingresos Extra', icon: Coins },
  { id: 'Coffee', label: 'Café / Restaurantes', icon: Coffee },
  { id: 'Dumbbell', label: 'Deportes / Gym', icon: Dumbbell },
  { id: 'Plane', label: 'Viajes / Vacaciones', icon: Plane },
  { id: 'Wifi', label: 'Internet / Datos', icon: Wifi },
  { id: 'Zap', label: 'Luz / Servicios', icon: Zap },
  { id: 'ShieldCheck', label: 'Seguros', icon: ShieldCheck },
  { id: 'Gift', label: 'Regalos / Donaciones', icon: Gift },
  { id: 'Smartphone', label: 'Telefonía', icon: Smartphone },
  { id: 'PiggyBank', label: 'Ahorro', icon: PiggyBank },
  { id: 'DollarSign', label: 'Finanzas', icon: DollarSign },
  { id: 'Layers', label: 'Otros Gastos', icon: Layers },
];

export const COLOR_PALETTE = [
  '#3b82f6', // Azul
  '#06b6d4', // Cyan
  '#10b981', // Esmeralda
  '#84cc16', // Lima
  '#f59e0b', // Ámbar
  '#f97316', // Naranja
  '#ef4444', // Rojo
  '#ec4899', // Rosa
  '#8b5cf6', // Violeta
  '#6366f1', // Índigo
  '#14b8a6', // Teal
  '#64748b', // Slate
];

export function getCategoryIconComponent(iconName: string): LucideIcon {
  const match = AVAILABLE_ICONS.find((item) => item.id === iconName);
  return match ? match.icon : Layers;
}
