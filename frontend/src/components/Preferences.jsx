import { useState } from 'react'
import { Users, MapPin, Heart, Settings, X } from 'lucide-react'
import './Preferences.css'

const INTERESTS = [
  '🎮 Gaming', '🎵 Music', '🎬 Movies', '⚽ Sports',
  '✈️ Travel', '🍕 Food', '🎨 Art', '💻 Technology',
  '📚 Books', '🎭 Theater', '🏋️ Fitness', '🐕 Pets',
  '📸 Photography', '🎤 Singing', '💃 Dancing', '🎓 Education'
];

const COUNTRIES = [
  { code: 'ANY', name: '🌍 Any Country (Worldwide)' },
  { code: 'US', name: '🇺🇸 United States' },
  { code: 'IN', name: '🇮🇳 India' },
  { code: 'GB', name: '🇬🇧 United Kingdom' },
  { code: 'CA', name: '🇨🇦 Canada' },
  { code: 'AU', name: '🇦🇺 Australia' },
  { code: 'DE', name: '🇩🇪 Germany' },
  { code: 'FR', name: '🇫🇷 France' },
  { code: 'ES', name: '🇪🇸 Spain' },
  { code: 'IT', name: '🇮🇹 Italy' },
  { code: 'NL', name: '🇳🇱 Netherlands' },
  { code: 'BR', name: '🇧🇷 Brazil' },
  { code: 'MX', name: '🇲🇽 Mexico' },
  { code: 'AR', name: '🇦🇷 Argentina' },
  { code: 'PK', name: '🇵🇰 Pakistan' },
  { code: 'BD', name: '🇧🇩 Bangladesh' },
  { code: 'JP', name: '🇯🇵 Japan' },
  { code: 'KR', name: '🇰🇷 South Korea' },
  { code: 'CN', name: '🇨🇳 China' },
  { code: 'TH', name: '🇹🇭 Thailand' },
  { code: 'VN', name: '🇻🇳 Vietnam' },
  { code: 'PH', name: '🇵🇭 Philippines' },
  { code: 'ID', name: '🇮🇩 Indonesia' },
  { code: 'MY', name: '🇲🇾 Malaysia' },
  { code: 'SG', name: '🇸🇬 Singapore' },
  { code: 'RU', name: '🇷🇺 Russia' },
  { code: 'UA', name: '🇺🇦 Ukraine' },
  { code: 'PL', name: '🇵🇱 Poland' },
  { code: 'TR', name: '🇹🇷 Turkey' },
  { code: 'SA', name: '🇸🇦 Saudi Arabia' },
  { code: 'AE', name: '🇦🇪 UAE' },
  { code: 'EG', name: '🇪🇬 Egypt' },
  { code: 'ZA', name: '🇿🇦 South Africa' },
  { code: 'NG', name: '🇳🇬 Nigeria' },
  { code: 'KE', name: '🇰🇪 Kenya' }
];

const GENDERS = [
  { value: 'any', label: '👥 Everyone' },
  { value: 'male', label: '👨 Male' },
  { value: 'female', label: '👩 Female' },
  { value: 'other', label: '🌈 Other' }
];

function Preferences({ isOpen, onClose, preferences, onSave }) {
  const [localPreferences, setLocalPreferences] = useState(preferences)

  const toggleInterest = (interest) => {
    const newInterests = localPreferences.interests.includes(interest)
      ? localPreferences.interests.filter(i => i !== interest)
      : [...localPreferences.interests, interest]
    
    setLocalPreferences({ ...localPreferences, interests: newInterests })
  }

  const handleSave = () => {
    onSave(localPreferences)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="preferences-overlay">
      <div className="preferences-modal">
        <div className="preferences-header">
          <div className="header-title">
            <Settings size={24} />
            <h2>Chat Preferences</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="preferences-content">
          {/* Your Gender */}
          <div className="preference-section">
            <div className="section-title">
              <Users size={20} />
              <h3>Your Gender</h3>
            </div>
            <div className="gender-options">
              {GENDERS.map(gender => (
                <button
                  key={gender.value}
                  className={`option-btn ${localPreferences.myGender === gender.value ? 'active' : ''}`}
                  onClick={() => setLocalPreferences({ ...localPreferences, myGender: gender.value })}
                >
                  {gender.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="preference-section">
            <div className="section-title">
              <Users size={20} />
              <h3>Match With</h3>
            </div>
            <div className="gender-options">
              {GENDERS.map(gender => (
                <button
                  key={gender.value}
                  className={`option-btn ${localPreferences.gender === gender.value ? 'active' : ''}`}
                  onClick={() => setLocalPreferences({ ...localPreferences, gender: gender.value })}
                >
                  {gender.label}
                </button>
              ))}
            </div>
          </div>

          {/* Country Filter */}
          <div className="preference-section">
            <div className="section-title">
              <MapPin size={20} />
              <h3>Match People From</h3>
            </div>
            <p className="section-description">
              Choose a specific country or chat with anyone worldwide!
            </p>
            <select
              className="country-select"
              value={localPreferences.country}
              onChange={(e) => setLocalPreferences({ ...localPreferences, country: e.target.value })}
            >
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Interests */}
          <div className="preference-section">
            <div className="section-title">
              <Heart size={20} />
              <h3>Interests (Optional)</h3>
            </div>
            <p className="section-description">
              Select interests to match with people who share them!
            </p>
            <div className="interests-grid">
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  className={`interest-tag ${localPreferences.interests.includes(interest) ? 'active' : ''}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="preferences-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save & Start Chatting
          </button>
        </div>
      </div>
    </div>
  )
}

export default Preferences

