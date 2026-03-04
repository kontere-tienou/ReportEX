// pages/departments/reports/builder/components/TextBlock.jsx

export default function TextBlock({ component }) {
    return (
        <div className="p-4 text-gray-700 whitespace-pre-wrap">
            {component.config.content}
        </div>
    );
}