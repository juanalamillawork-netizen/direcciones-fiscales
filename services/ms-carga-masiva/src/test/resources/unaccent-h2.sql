CREATE ALIAS IF NOT EXISTS UNACCENT AS '
    String unaccent(String s) {
        if (s == null) return null;
        return java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
            .toUpperCase();
    }
';
