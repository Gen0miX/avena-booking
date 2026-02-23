-- ============================================
-- Script de création de la table pricing_periods
-- Pour les périodes PERSONNALISÉES uniquement (ex: Carnaval)
--
-- Les tarifs par défaut (Basse saison, Novembre, Hiver, Fêtes)
-- sont gérés automatiquement dans le code
-- ============================================

-- Créer la table pricing_periods
CREATE TABLE IF NOT EXISTS pricing_periods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_standard INTEGER NOT NULL,
  price_five INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Index pour les requêtes de plage de dates
CREATE INDEX IF NOT EXISTS idx_pricing_periods_dates ON pricing_periods (start_date, end_date);

-- Activer RLS
ALTER TABLE pricing_periods ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
DROP POLICY IF EXISTS "Public can read pricing periods" ON pricing_periods;
CREATE POLICY "Public can read pricing periods"
  ON pricing_periods FOR SELECT
  USING (true);

-- Politique de modification pour les utilisateurs authentifiés
DROP POLICY IF EXISTS "Authenticated users can manage pricing periods" ON pricing_periods;
CREATE POLICY "Authenticated users can manage pricing periods"
  ON pricing_periods FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- Périodes personnalisées : CARNAVAL
-- Ces périodes prennent priorité sur les tarifs par défaut
-- Prix : 350 CHF (≤4 adultes) / 400 CHF (5 adultes)
-- ============================================

INSERT INTO pricing_periods (name, start_date, end_date, price_standard, price_five) VALUES
('Carnaval 2027', '2027-02-05', '2027-02-22', 350, 400),
('Carnaval 2028', '2028-02-11', '2028-03-06', 350, 400),
('Carnaval 2029', '2029-02-09', '2029-02-26', 350, 400);

-- ============================================
-- RAPPEL : Tarifs par défaut (gérés dans le code)
--
-- Basse saison (Mai-Octobre) : 200 / 250 CHF
-- Novembre : 250 / 250 CHF
-- Hiver (11 Jan - 30 Avril + 1-17 Déc) : 280 / 300 CHF
-- Fêtes (18 Déc - 10 Jan) : 350 / 400 CHF
-- ============================================
