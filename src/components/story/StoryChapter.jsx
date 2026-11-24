/** One story chapter's copy: rubber stamp initial, index, title, body. */
export function StoryChapter({ chapter, index, align, anchorId }) {
  const titleId = `chapter-${chapter.id}-title`
  return (
    <article id={anchorId} className={`chapter chapter--${align}`} data-index={index} aria-labelledby={titleId}>
      <span className="chapter__stamp" aria-hidden="true">
        {chapter.stamp}
      </span>
      <p className="chapter__meta mono">
        {String(index + 1).padStart(2, '0')} / {chapter.name}
      </p>
      <h2 className="chapter__title" id={titleId}>
        {chapter.title.split(' ').map((w, i) => (
          <span key={i}>
            <span className="chapter__line">
              <span>{w}</span>
            </span>{' '}
          </span>
        ))}
      </h2>
      <p className="chapter__body">{chapter.body}</p>
    </article>
  )
}
