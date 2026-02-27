import React, { memo } from 'react';

const CharacterInfoCard = memo(() => (
    <div className="character-info-card">
        <div className="character-info-item">
            <span className="character-name atomic">Atomic</span>
            <span className="character-desc">Accurate, concise, and truthful answers. Precise and reliable like a scientist.</span>
        </div>
        <div className="character-info-item">
            <div className="character-name-wrapper">
                <span className="character-name jahnvi">Jahnvi</span>
                <span className="unavailable-badge">Currently Unavailable</span>
            </div>
            <span className="character-desc">A knowledgeable girl. Makes complex topics easy to understand.</span>
        </div>
        <div className="character-info-item">
            <span className="character-name chandni">Chandni</span>
            <span className="character-desc">Calm, reserved, and to-the-point. She has some anger issues.</span>
        </div>
        <div className="character-info-item">
            <span className="character-name bhaiya">Harsh Bhaiya</span>
            <span className="character-desc">Founder of Sheryians Coding School. Direct, motivational mentor who cares for student success.</span>
        </div>
        <div className="character-info-item">
            <span className="character-name osho">Osho</span>
            <span className="character-desc">Indian mystic and spiritual master. Spontaneous, paradoxical, and meditative wisdom.</span>
        </div>
    </div>
));

CharacterInfoCard.displayName = 'CharacterInfoCard';
export default CharacterInfoCard;
