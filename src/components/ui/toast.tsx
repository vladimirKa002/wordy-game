import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 left-0 right-0 z-[100] flex flex-col-reverse p-4 overflow-hidden sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      "max-h-[100dvh] will-change-transform",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-3 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        warning:
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200",
        success:
          "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200",
        error_letter:
          "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-200",
        error_repeat:
          "border-pink-200 bg-pink-50 text-pink-900 dark:border-pink-800 dark:bg-pink-900/20 dark:text-pink-200",
        export_success:
          "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
        import_success:
          "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
        export_error:
          "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-200",
        import_error:
          "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 group-[.warning]:text-amber-600/50 group-[.warning]:hover:text-amber-900 group-[.warning]:focus:ring-amber-400 group-[.warning]:focus:ring-offset-amber-50 group-[.success]:text-green-600/50 group-[.success]:hover:text-green-900 group-[.success]:focus:ring-green-400 group-[.success]:focus:ring-offset-green-50 group-[.error_letter]:text-orange-600/50 group-[.error_letter]:hover:text-orange-900 group-[.error_letter]:focus:ring-orange-400 group-[.error_letter]:focus:ring-offset-orange-50 group-[.error_repeat]:text-pink-600/50 group-[.error_repeat]:hover:text-pink-900 group-[.error_repeat]:focus:ring-pink-400 group-[.error_repeat]:focus:ring-offset-pink-50 group-[.import_success]:text-blue-600/50 group-[.import_success]:hover:text-blue-900 group-[.import_success]:focus:ring-blue-400 group-[.import_success]:focus:ring-offset-blue-50 group-[.import_error]:text-orange-600/50 group-[.import_error]:hover:text-orange-900 group-[.import_error]:focus:ring-orange-400 group-[.import_error]:focus:ring-offset-orange-50",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
