import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "../ThemeProvider"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { mode } = useTheme()

  return (
    <Sonner
      theme={mode as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors={true}
      closeButton={true}
      icons={{
        success: <CircleCheckIcon className="h-5 w-5" />,
        info: <InfoIcon className="h-5 w-5" />,
        warning: <TriangleAlertIcon className="h-5 w-5" />,
        error: <OctagonXIcon className="h-5 w-5" />,
        loading: <Loader2Icon className="h-5 w-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          // 仅对 default 类型的 toast 应用应用背景色，其他类型使用 richColors 的颜色
          toast: "group toast group-[.toaster]:shadow-lg font-sans data-[type=default]:bg-background data-[type=default]:text-foreground data-[type=default]:border-border data-[type=default]:border",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
