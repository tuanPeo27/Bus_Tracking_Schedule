import React from "react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

export function AnimatedTabs({ value, onValueChange, children, className }) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      {children}
    </Tabs>
  );
}

export function AnimatedTabsList({ children, className }) {
  return <TabsList className={className}>{children}</TabsList>;
}

export function AnimatedTabsTrigger({ value, children, className }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <TabsTrigger value={value} className={`relative ${className || ""}`}>
        {children}
      </TabsTrigger>
    </motion.div>
  );
}

export function AnimatedTabsContent({ value, children, className }) {
  return (
    <TabsContent value={value} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </TabsContent>
  );
}
