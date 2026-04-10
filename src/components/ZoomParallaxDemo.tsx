'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { TrendingUp, DollarSign, Users, BarChart3, Rocket, Target, Zap } from 'lucide-react';

export default function ZoomParallaxDemo() {
	const items = [
		{
			initialOffset: { x: '-20vw', y: '-20vh' },
			content: (
				<div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center">
					<BarChart3 className="w-16 h-16 text-emerald-400 mb-4" />
					<h3 className="text-white font-bold text-lg">Relatórios Incríveis</h3>
					<p className="text-zinc-300 text-xs">Dados em tempo real</p>
				</div>
			),
		},
		{
			initialOffset: { x: '20vw', y: '-20vh' },
			content: (
				<div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center">
					<Rocket className="w-16 h-16 text-emerald-400 mb-4" />
					<h3 className="text-white font-bold text-lg">Crescimento 300%</h3>
					<p className="text-zinc-300 text-xs">Escala acelerada</p>
				</div>
			),
		},
		{
			initialOffset: { x: '-20vw', y: '20vh' },
			content: (
				<div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center">
					<DollarSign className="w-16 h-16 text-yellow-400 mb-4" />
					<h3 className="text-white font-bold text-lg">Lucro Líquido</h3>
					<p className="text-zinc-300 text-xs">ROI otimizado</p>
				</div>
			),
		},
		{
			initialOffset: { x: '20vw', y: '20vh' },
			content: (
				<div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center">
					<TrendingUp className="w-16 h-16 text-blue-400 mb-4" />
					<h3 className="text-white font-bold text-lg">Métricas de Elite</h3>
					<p className="text-zinc-300 text-xs">Performance superior</p>
				</div>
			),
		},
		{
			initialOffset: { x: '-25vw', y: '0vh' },
			content: (
				<div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center">
					<Target className="w-16 h-16 text-emerald-400 mb-4" />
					<h3 className="text-white font-bold text-lg">Foco em Conversão</h3>
					<p className="text-zinc-300 text-xs">Resultados garantidos</p>
				</div>
			),
		},
		{
			initialOffset: { x: '25vw', y: '0vh' },
			content: (
				<div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center">
					<Users className="w-16 h-16 text-purple-400 mb-4" />
					<h3 className="text-white font-bold text-lg">Retenção de Elite</h3>
					<p className="text-zinc-300 text-xs">Clientes fiéis</p>
				</div>
			),
		},
		{
			initialOffset: { x: '0vw', y: '0vh' },
			content: (
				<div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center">
					<Zap className="w-16 h-16 text-orange-400 mb-4" />
					<h3 className="text-white font-bold text-lg">Alta Performance</h3>
					<p className="text-zinc-300 text-xs">Velocidade e escala</p>
				</div>
			),
		},
	];

	return (
		<main className="w-full">
            <div className="py-12 text-center">
                <h2 className="text-3xl md:text-4xl font-light tracking-tighter mb-4 font-serif">
                    A Engrenagem do <span className="italic text-zinc-500 font-bold">Tráfego Pago</span>
                </h2>
                <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto">
                    Do funil de conversão à escala de operações de elite: cada etapa desenhada para maximizar seu ROI e garantir contratos fechados diariamente.
                </p>
            </div>
			<ZoomParallax items={items} />
		</main>
	);
}
