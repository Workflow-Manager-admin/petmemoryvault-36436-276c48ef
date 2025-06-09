import React, { useState } from "react";
import "./App.css";

/*
  COLOR PALETTE (as CSS variables for easy reference)
    --pmv-primary: #F7C59F;
    --pmv-secondary: #A3D2CA;
    --pmv-accent: #5E6472;
*/

const COLOR_VARS = {
  "--pmv-primary": "#F7C59F",
  "--pmv-secondary": "#A3D2CA",
  "--pmv-accent": "#5E6472",
  "--pmv-bg": "#fff",
  "--pmv-dark-text": "#363636",
};

function setCSSVars() {
  for (let key in COLOR_VARS) {
    document.documentElement.style.setProperty(key, COLOR_VARS[key]);
  }
}
setCSSVars();

// Simple paw SVG as default profile image
const PawIcon = ({ size = 100 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
    <circle cx="32" cy="45" r="15" fill="var(--pmv-secondary)" stroke="var(--pmv-accent)" strokeWidth="2"/>
    <ellipse cx="18" cy="24" rx="6" ry="9" fill="var(--pmv-primary)" stroke="var(--pmv-accent)" strokeWidth="2"/>
    <ellipse cx="32" cy="19" rx="7" ry="10" fill="var(--pmv-primary)" stroke="var(--pmv-accent)" strokeWidth="2"/>
    <ellipse cx="46" cy="24" rx="6" ry="9" fill="var(--pmv-primary)" stroke="var(--pmv-accent)" strokeWidth="2"/>
    <ellipse cx="24" cy="13" rx="4" ry="7" fill="var(--pmv-secondary)" stroke="var(--pmv-accent)" strokeWidth="2"/>
    <ellipse cx="40" cy="13" rx="4" ry="7" fill="var(--pmv-secondary)" stroke="var(--pmv-accent)" strokeWidth="2"/>
  </svg>
);

// PUBLIC_INTERFACE
function App() {
  // Main state, simple for MVP (not persisted)
  const [activeTab, setActiveTab] = useState("timeline");
  const [profileImg, setProfileImg] = useState(null);
  const [memories, setMemories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [milestones, setMilestones] = useState([]);
  // Scrapbook auto-compiles from photos & milestones

  // Profile upload handler
  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setProfileImg(evt.target.result);
    reader.readAsDataURL(file);
  };

  // Add Memory handler
  // PUBLIC_INTERFACE
  function addMemory({ text, date, fileList }) {
    let attachedPhotos = [];
    if (fileList && fileList.length > 0) {
      for (const file of fileList) {
        const url = URL.createObjectURL(file);
        attachedPhotos.push(url);
        // Also add to photos collection
        setPhotos((prev) => [...prev, url]);
      }
    }
    setMemories((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        date,
        photos: attachedPhotos,
      },
    ]);
  }

  // Add Milestone
  // PUBLIC_INTERFACE
  function addMilestone({ title, date, description }) {
    setMilestones((prev) => [
      ...prev,
      { id: Date.now(), title, date, description },
    ]);
  }

  // Photo upload (batch upload, list of files)
  // PUBLIC_INTERFACE
  function addPhoto(files) {
    let fileUrls = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      fileUrls.push(url);
    }
    setPhotos((prev) => [...prev, ...fileUrls]);
  }

  // TAB NAVIGATION -- tabs for Timeline, Photos, Milestones, Scrapbook
  const tabs = [
    { key: "timeline", label: "Timeline" },
    { key: "photos", label: "Photos" },
    { key: "milestones", label: "Milestones" },
    { key: "scrapbook", label: "Scrapbook" },
  ];

  // Shareable Links (Mock implementation, would be generated on backend in real app)
  function getShareUrl(section) {
    // In real app this would be a unique link, here it's just a simulated anchor.
    return window.location.origin + "/share/" + section;
  }

  return (
    <div className="pmv-app pmv-light">
      <PetMemoryNavbar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profileImg={profileImg}
        handleProfileImgChange={handleProfileImgChange}
      />

      <main className="pmv-maincontainer">

        {/* Home Profile with profile image and quick app description */}
        {activeTab === "timeline" && (
          <PetTimeline
            memories={memories}
            milestones={milestones}
            addMemory={addMemory}
            profileImg={profileImg}
          />
        )}
        {activeTab === "photos" && (
          <PetPhotos
            photos={photos}
            addPhoto={addPhoto}
          />
        )}
        {activeTab === "milestones" && (
          <PetMilestones
            milestones={milestones}
            addMilestone={addMilestone}
          />
        )}
        {activeTab === "scrapbook" && (
          <PetScrapbook
            memories={memories}
            photos={photos}
            milestones={milestones}
          />
        )}

        {/* Shareable Links */}
        <div className="pmv-share-section">
          <span className="pmv-share-label">Share:</span>
          <ShareButton
            label="Timeline"
            url={getShareUrl("timeline")}
          />
          <ShareButton
            label="Scrapbook"
            url={getShareUrl("scrapbook")}
          />
        </div>
      </main>
    </div>
  );
}

// ---- NAVBAR ----
function PetMemoryNavbar({ tabs, activeTab, setActiveTab, profileImg, handleProfileImgChange }) {
  return (
    <nav className="pmv-navbar">
      <div className="pmv-navbar-content">
        <span className="pmv-logo">
          <span className="pmv-logo-symbol">🐾</span>
          <span className="pmv-logo-title">PetMemoryVault</span>
        </span>
        <nav className="pmv-navlinks">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={"pmv-nav-btn" + (activeTab === key ? " active" : "")}
              style={activeTab === key ? { background: "var(--pmv-secondary)" } : {}}
              onClick={() => setActiveTab(key)}
            >{label}</button>
          ))}
        </nav>
        <ProfileImgUpload profileImg={profileImg} handleProfileImgChange={handleProfileImgChange} />
      </div>
    </nav>
  );
}

// PET PROFILE IMAGE UPLOAD/VIEW
function ProfileImgUpload({ profileImg, handleProfileImgChange }) {
  return (
    <div className="pmv-profile-img-upload">
      <label htmlFor="pmv-profile-upload" style={{ cursor: "pointer" }}>
        <span className="pmv-profile-avatar">
          {profileImg ? (
            <img src={profileImg} alt="Pet Profile" />
          ) : (
            <PawIcon size={40} />
          )}
        </span>
        <input id="pmv-profile-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileImgChange} />
      </label>
      <span className="pmv-profile-upload-text">{profileImg ? "Change Photo" : "Add Photo"}</span>
    </div>
  );
}

// ---- TIMELINE COMPONENT ----
function PetTimeline({ memories, milestones, addMemory, profileImg }) {
  return (
    <div className="pmv-section">
      <div className="pmv-profile-hero">
        <span className="pmv-profile-image">
          {profileImg ? (
            <img src={profileImg} alt="Pet" />
          ) : (
            <PawIcon size={80} />
          )}
        </span>
        <div>
          <h2 className="pmv-section-title">Your Pet's Timeline</h2>
          <p className="pmv-section-desc">
            Cherish every moment in a beautiful, chronological story. Add memories as you go!
          </p>
        </div>
      </div>
      <AddMemoryForm addMemory={addMemory} />
      <TimelineList memories={memories} milestones={milestones} />
    </div>
  );
}

// ---- PHOTOS COMPONENT ----
function PetPhotos({ photos, addPhoto }) {
  // PUBLIC_INTERFACE
  // photo upload via input
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      addPhoto(files);
    }
  };
  return (
    <div className="pmv-section">
      <h2 className="pmv-section-title">Photo Gallery</h2>
      <p className="pmv-section-desc">
        Upload and browse all your favorite photos of your pet.
      </p>
      <input
        className="pmv-photo-input"
        type="file"
        id="pmv-photo-upload"
        multiple
        accept="image/*"
        onChange={handlePhotoUpload}
      />
      <label htmlFor="pmv-photo-upload" className="pmv-upload-btn">Upload Photos</label>
      <div className="pmv-photo-grid">
        {photos.length === 0 && <span className="pmv-placeholder">No photos uploaded yet.</span>}
        {photos.map((ph, idx) => (
          <img className="pmv-photo-thumb" src={ph} alt={`pet ${idx+1}`} key={ph+idx} />
        ))}
      </div>
    </div>
  );
}

// ---- MILESTONES COMPONENT ----
function PetMilestones({ milestones, addMilestone }) {
  return (
    <div className="pmv-section">
      <h2 className="pmv-section-title">Milestones</h2>
      <p className="pmv-section-desc">
        Remember big moments: birthday, homecoming, first trick, and more.
      </p>
      <AddMilestoneForm addMilestone={addMilestone} />

      <div className="pmv-milestones-list">
        {milestones.length === 0 && <span className="pmv-placeholder">No milestones added yet.</span>}
        {milestones.map(m => (
          <div className="pmv-milestone" key={m.id}>
            <h4>{m.title}</h4>
            <small>{m.date}</small>
            <p>{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- SCRAPBOOK COMPONENT ----
function PetScrapbook({ memories, photos, milestones }) {
  // The scrapbook combines all photos, milestones, and allows simple text description
  const [desc, setDesc] = useState("A lovingly compiled scrapbook of every photo and milestone!");

  return (
    <div className="pmv-section pmv-scrapbook">
      <h2 className="pmv-section-title">Scrapbook</h2>
      <textarea
        className="pmv-scrapbook-desc"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        rows={2}
      />
      <div className="pmv-scrapbook-section pmv-scrapbook-photos">
        <h3>All Photos</h3>
        {photos.length === 0 && <span className="pmv-placeholder">No photos yet.</span>}
        <div className="pmv-photo-grid scrapbook">
          {photos.map((ph, idx) => (
            <img className="pmv-photo-thumb" src={ph} alt={`scrapbook photo ${idx+1}`} key={ph+idx} />
          ))}
        </div>
      </div>
      <div className="pmv-scrapbook-section pmv-scrapbook-milestones">
        <h3>Milestones</h3>
        {milestones.length === 0 && <span className="pmv-placeholder">No milestones yet.</span>}
        <ol className="pmv-milestones-list scrapbook">
          {milestones.map((ms, idx) => (
            <li className="pmv-milestone scrapbook" key={ms.id}>
              <span className="pmv-ms-title">{ms.title}</span>
              <small className="pmv-ms-date">{ms.date}</small>
              <span className="pmv-ms-desc">{ms.description}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ------- SUBCOMPONENTS ----------
// Add Memory form (Timeline)
// PUBLIC_INTERFACE
function AddMemoryForm({ addMemory }) {
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [photos, setPhotos] = useState([]);

  const onFileChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim() || !date) return;
    addMemory({ text, date, fileList: photos });
    setText("");
    setDate("");
    setPhotos([]);
    e.target.reset();
  }
  return (
    <form className="pmv-form pmv-add-memory-form" onSubmit={handleSubmit}>
      <input
        type="date"
        required
        value={date}
        onChange={e => setDate(e.target.value)}
        className="pmv-input"
      />
      <textarea
        placeholder="Share a new memory..."
        value={text}
        onChange={e => setText(e.target.value)}
        className="pmv-input"
        required
      />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
        className="pmv-input"
      />
      <button className="pmv-btn pmv-primary-btn" type="submit">
        Add Memory
      </button>
    </form>
  );
}

// Timeline List
function TimelineList({ memories, milestones }) {
  // Combine memories and milestones by date
  const combined = [
    ...memories.map(mem => ({
      type: "memory",
      ...mem
    })),
    ...milestones.map(mil => ({
      type: "milestone",
      ...mil
    }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date)); // oldest first

  if (combined.length === 0) {
    return <div className="pmv-placeholder">No memories or milestones added yet.</div>;
  }

  return (
    <ol className="pmv-timeline-list">
      {combined.map(item => (
        <li className={`pmv-timeline-item ${item.type}`} key={item.id}>
          <div className="pmv-tl-date">{item.date}</div>
          {item.type === "memory" ? (
            <div>
              <span className="pmv-tl-label">Memory</span>
              <p>{item.text}</p>
              {item.photos && item.photos.length > 0 && (
                <div className="pmv-inline-photos">
                  {item.photos.map((ph, idx) => (
                    <img className="pmv-photo-thumb small" src={ph} alt="memory" key={ph+idx}/>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <span className="pmv-tl-label milestone">Milestone</span>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

// Add Milestone form (Milestones page)
function AddMilestoneForm({ addMilestone }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    addMilestone({ title, date, description: desc });
    setTitle(""); setDate(""); setDesc("");
    e.target.reset();
  };

  return (
    <form className="pmv-form pmv-add-milestone-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Milestone Title"
        value={title}
        required
        onChange={e => setTitle(e.target.value)}
        className="pmv-input"
      />
      <input
        type="date"
        value={date}
        required
        onChange={e => setDate(e.target.value)}
        className="pmv-input"
      />
      <textarea
        placeholder="Description"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        className="pmv-input"
      />
      <button className="pmv-btn pmv-primary-btn" type="submit">
        Add Milestone
      </button>
    </form>
  );
}

// SHARE BUTTON COMPONENT
function ShareButton({ label, url }) {
  // Copy to clipboard on click
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button className="pmv-btn pmv-share-btn" onClick={handleCopy}>
      {label} <span className="pmv-share-icon">🔗</span>
      {copied && <span className="pmv-share-copied">Copied!</span>}
    </button>
  );
}

export default App;
