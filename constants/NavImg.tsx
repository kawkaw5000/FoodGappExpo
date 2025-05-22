// constants/getDashboardIcons.ts
export function NavImg() {
  return [
    {
      name: "Log",
      icon: require("../assets/images/Dashboard Icons/Food_Nohighlight.png"),
      highlight: require("../assets/images/Dashboard Icons/Food_Highlight.png"),
      route: "/(log)",
    },
    {
      name: "Track",
      icon: require("../assets/images/Dashboard Icons/Track_Nohighlight.png"),
      highlight: require("../assets/images/Dashboard Icons/Track_Highlight.png"),
      route: "/(track)",
    },
    {
      name: "Home",
      icon: require("../assets/images/Dashboard Icons/Home_Nohighlight.png"),
      highlight: require("../assets/images/Dashboard Icons/Home_Highlight.png"),
      route: "/(home)",
    },
    {
      name: "Scan",
      icon: require("../assets/images/Dashboard Icons/Scan_Nohighlight.png"),
      highlight: require("../assets/images/Dashboard Icons/Scan_Highlight.png"),
      route: "/(scan)",
    },
    {
      name: "Profile",
      icon: require("../assets/images/Dashboard Icons/Profile_Nohighlight.png"),
      highlight: require("../assets/images/Dashboard Icons/Profile_Highlight.png"),
      route: "/(profile)",
    },
  ];
}
