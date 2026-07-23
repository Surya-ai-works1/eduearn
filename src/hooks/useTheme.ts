import { useTheme as useNextTheme } from "next-themes";

/**
 * Custom wrapper hook around next-themes to make theme querying and toggling cleaner.
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
  };
}
export default useTheme;
