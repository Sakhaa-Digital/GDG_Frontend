export const fileTypeIcon = (sourceType) => {
    if (!sourceType) return "📄";
    if (sourceType.includes("pdf")) return "📕";
    if (sourceType.includes("image")) return "🖼️";
    if (sourceType.includes("word") || sourceType.includes("document")) return "📘";
    if (sourceType.includes("text")) return "📝";
    return "📄";
};

export const fileTypeLabel = (sourceType) => {
    if (!sourceType) return "File";
    if (sourceType.includes("pdf")) return "PDF";
    if (sourceType.includes("jpeg") || sourceType.includes("jpg")) return "JPEG";
    if (sourceType.includes("png")) return "PNG";
    if (sourceType.includes("word") || sourceType.includes("docx")) return "DOCX";
    if (sourceType.includes("text")) return "TXT";
    return sourceType.split("/")[1]?.toUpperCase() || "FILE";
};

export const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};