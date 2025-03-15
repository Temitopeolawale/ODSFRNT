import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "./Card";

export function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="bg-white border-purple-100 shadow-md hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-2">
        <Icon className="h-6 w-6 text-purple-600 mb-2" />
        <CardTitle className="text-purple-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}