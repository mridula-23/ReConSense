export const checkBackendHealth = async () => {
    try {
        const response = await fetch("http://localhost:8000/api/health");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch backend health:", error);
        return null;
    }
};
