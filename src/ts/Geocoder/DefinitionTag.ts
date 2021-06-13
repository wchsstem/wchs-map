/** Tag which may be present on a definition */
export enum DefinitionTag {
    /**
     * Location is closed to everyone. Should not be used on rooms when expected limited access is enforced (eg.
     * electrical closets aren't closed just because you can't enter them).
     */
    Closed = "closed",
    /** Bathroom for women */
    WomenBathroom = "women-bathroom",
    /** Bathroom for men */
    MenBathroom = "men-bathroom",
    /** Bathroom gender currently unknown */
    UnknownBathroom = "unknown-bathroom",
    /** Bathroom Supply Closet */
    BSC = "bsc",
    /** Water Fountain */
    WF = "wf",
    /** Electrical Closet */
    EC = "ec",
    /** Water Fountain */
    EF = "wf",
    /** Hand Sanitizing station */
    HS = "hs",
    /** Emergency Bleeding Control kits, installed in case of school shooting or similar event */
    BleedControl = "bleed-control",
    /** Defibrillator */
    AED = "aed",
    /** Air Handling Unit (HVAC room that blows air around) */
    AHU = "ahu",
    /** Intermediate Distribution Frame (support room for Internet and/or telephones) */
    IDF = "idf",
    /** Main Distribution Frame (main room for Internet and/or telephones) */
    MDF = "mdf",
    /** ERU, unknown meaning but likely HVAC-related; some doors are labeled as ERUs */
    ERU = "eru",
    /** Control Panel, security rooms housing a control panel and other such equipment */
    CP = "cp",
}
