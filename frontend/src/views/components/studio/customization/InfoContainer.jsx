import React, { useState } from "react";
import NewButton from "../../home/Button";

function InfoContainer() {
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const [description, setDescription] = useState("");

    return (
        <div className="info-customization-container">
            <span>Name</span>
            <input type="text" id="channel-name-input" className="rectangle-customization" placeholder="name" value={name} onChange={(e) => setName(e.target.value)}/>

            <span>Handle</span>
            <input type="text" id="channel-handle-input" className="rectangle-customization" placeholder="@name" value={handle} onChange={(e) => setHandle(e.target.value)}/>

            <span>Description</span>
            <input type="text" id="channel-description-input" className="rectangle-customization-description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}/>
            
            <NewButton id="publish-changes-btn" btnclass="custom-file-label" btntitle="Publish"></NewButton>
        </div>

    );
}

export default InfoContainer;