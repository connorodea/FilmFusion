"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@/i18n/routing"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function SignUpPage() {
  const t = useTranslations("auth.signUp")

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" type="text" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button className="w-full">{t("signUpButton")}</Button>
          <div className="text-center text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              {t("signIn")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
