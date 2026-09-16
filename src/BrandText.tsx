export function CommunityName({ text }: { text: string }) {
  const name = /^UC(\s+)Community$/.exec(text);
  if (!name) return text;
  return (
    <>
      <span className="brand-u">U</span>
      <span className="brand-c">C</span>
      {name[1]}
      <span className="community-c">C</span>ommunity
    </>
  );
}

export function SeriesTitle({ text }: { text: string }) {
  return text.split(/(\s+)/).map((word, index) =>
    ["Thursday", "Tech", "Talk"].includes(word) ? (
      <span className="series-word" key={index}>
        <span className="series-initial" data-word={word}>
          T
        </span>
        {word.slice(1)}
      </span>
    ) : (
      word
    ),
  );
}
