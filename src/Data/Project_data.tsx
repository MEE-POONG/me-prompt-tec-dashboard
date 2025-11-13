export interface Project {
    id: number; 
    name: string;
    description: string;
    imageSrc: string;
    projectLink: string;
    tags: string[];
}

export const projects: Project[] = [
    {
        id: 1,
        name: "AI Chatbot",
        description: "A conversational AI chatbot that provides instant responses to user queries.",
        imageSrc: "/images/projects/ai-chatbot.png",
        projectLink: "/",
        tags: ["AI", "Chatbot", "NLP"],
    },
    {
        id: 2,
        name: "E-commerce Platform",    
        description: "A full-featured e-commerce platform for buying and selling products online.",
        imageSrc: "/images/projects/ecommerce-platform.png",
        projectLink: "/",
        tags: ["E-commerce", "Web Development", "React"],
    },
    {
        id: 3,
        name: "Social Media App",
        description: "A social media application that connects people and allows them to share content.",
        imageSrc: "/images/projects/social-media-app.png",
        projectLink: "/",
        tags: ["Social Media", "Mobile App", "Flutter"],
    },
    
];

