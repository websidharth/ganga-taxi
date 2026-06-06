"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { IoMdSunny } from "react-icons/io"
import { BsFillMoonStarsFill } from "react-icons/bs";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const handleToggle = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }
    return (
        <Button variant="ghost" onClick={handleToggle} className="bg-transparent border-0">
            {theme === "dark" ? <BsFillMoonStarsFill /> : <IoMdSunny />}
        </Button>
    )
}

