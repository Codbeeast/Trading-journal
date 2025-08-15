const ComparisonItem = ({ text, icon }) => (
    <li className="flex items-center gap-3">
        {icon}
        <span className="text-gray-300">{text}</span>
    </li>
);

export default ComparisonItem;