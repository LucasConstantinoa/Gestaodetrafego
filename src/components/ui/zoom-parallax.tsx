'use client';

import React, { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

interface Item {
	content: React.ReactNode;
	initialOffset?: { x: string; y: string };
}

interface ZoomParallaxProps {
	/** Array of items to be displayed in the parallax effect max 7 items */
	items: Item[];
}

export function ZoomParallax({ items }: ZoomParallaxProps) {
	const container = useRef(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
	});

	return (
		<div ref={container} className="relative h-[300vh]">
			<div className="sticky top-0 h-screen overflow-hidden">
				{items.map(({ content, initialOffset }, index) => {
					// Define the active scroll range for this item, normalized to [0, 1]
					const start = index / (items.length + 1);
					const end = (index + 2) / (items.length + 1);

					const scale = useTransform(scrollYProgress, [start, end], [0.5, 2]);
					const opacity = useTransform(scrollYProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
					const x = useTransform(scrollYProgress, [start, end], [initialOffset?.x || '0vw', '0vw']);
					const y = useTransform(scrollYProgress, [start, end], [initialOffset?.y || '0vh', '0vh']);

					return (
						<motion.div
							key={index}
							style={{ scale, x, y, opacity }}
							className="absolute top-0 flex h-full w-full items-center justify-center"
						>
							<div className="relative h-[30vh] w-[30vw] md:h-[25vh] md:w-[25vw]">
								{content}
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
