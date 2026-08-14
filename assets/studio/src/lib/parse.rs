use std::collections::HashMap;

/// A tiny key/value configuration parser.
///
/// Lines starting with `#` are comments. Everything else is split on the first `=`.
pub fn parse(input: &str) -> HashMap<String, String> {
    input
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty() && !line.starts_with('#'))
        .filter_map(|line| line.split_once('='))
        .map(|(key, value)| (key.trim().to_string(), value.trim().to_string()))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::parse;

    #[test]
    fn skips_comments_and_blank_lines() {
        let parsed = parse("# comment\n\nlink = stable\nrate=48\n");
        assert_eq!(parsed.get("link"), Some(&"stable".to_string()));
        assert_eq!(parsed.get("rate"), Some(&"48".to_string()));
        assert_eq!(parsed.len(), 2);
    }
}
