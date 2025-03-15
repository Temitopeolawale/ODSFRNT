import React from 'react';

export function Button({ 
  children, 
  className = "", 
  variant = "default", 
  size = "default", 
  ...props 
}) {
  // Base styles
  let baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors";
  
  // Size variants
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8"
  };
  
  // Style variants
  const variantClasses = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-gray-200 bg-white hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200"
  };
  
  const classes = [
    baseStyles,
    sizeClasses[size] || sizeClasses.default,
    variantClasses[variant] || variantClasses.default,
    className
  ].join(" ");
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}