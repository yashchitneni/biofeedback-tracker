CREATE TABLE biofeedback (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    mood INTEGER,
    gym_performance INTEGER,
    soreness INTEGER,
    sleep_quality INTEGER,
    energy_levels INTEGER,
    sex_drive INTEGER,
    hunger_levels INTEGER,
    cravings INTEGER,
    digestion INTEGER,
    additional_notes TEXT[],
    summary TEXT
);

CREATE TABLE metric_notes (
    id SERIAL PRIMARY KEY,
    biofeedback_id INTEGER REFERENCES biofeedback(id),
    metric VARCHAR(50) NOT NULL,
    notes TEXT NOT NULL
);

CREATE INDEX idx_biofeedback_date ON biofeedback(date);
CREATE INDEX idx_metric_notes_biofeedback_id ON metric_notes(biofeedback_id);