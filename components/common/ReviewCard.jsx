import { Star } from 'lucide-react';

const ReviewCard = ({ review, author, role, avatar }) => (
    <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl border border-gray-800 text-left h-full">
        <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
        </div>
        <p className="mb-6 text-gray-300">{review}</p>
        <div className="flex items-center gap-4 mt-auto">
            <img src={avatar} alt={author} className="w-12 h-12 rounded-full" />
            <div>
                <p className="font-semibold">{author}</p>
                <p className="text-sm text-gray-400">{role}</p>
            </div>
        </div>
    </div>
);

export default ReviewCard;