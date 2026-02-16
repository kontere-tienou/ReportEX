// brandingConstants.js

export const branding = {
    logo: "assets/logo/logo-batexi.png",
    logoWhite: "/assets/logo-batexi6WHITE.png",
    companyName: "BATEX-CI",
    tagline: "ERP - Système de Reporting",
    primaryColor: "#6B4F30",
    secondaryColor: "#D29B3A",
    backgroundColor: "#F3E2D8",
    textColor: "#4B3D27",
    errorColor: "#FF4C4C",

    createRadialGradient: (primaryColor, secondaryColor) => {
        return `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 100%)`;
    }
};


