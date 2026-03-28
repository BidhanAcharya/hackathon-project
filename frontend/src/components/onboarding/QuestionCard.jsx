import styles from './QuestionCard.module.css';

export default function QuestionCard({ empathy, empathyHi, question, questionHi, options, selected, onSelect }) {
  return (
    <div className={styles.card}>
      {empathy && (
        <div className={styles.empathy}>
          <p className={styles.empathyEn}>{empathy}</p>
          {empathyHi && <p className={styles.empathyHi}>{empathyHi}</p>}
        </div>
      )}
      <h2 className={styles.question}>{question}</h2>
      {questionHi && <p className={styles.questionHi}>{questionHi}</p>}
      <div className={styles.options}>
        {options.map((opt) => (
          <label key={opt.value} className={[styles.option, selected === opt.value ? styles.selected : ''].join(' ')}>
            <div className={styles.optionText}>
              <span className={styles.optionEn}>{opt.label}</span>
              {opt.labelHi && <span className={styles.optionHi}>{opt.labelHi}</span>}
            </div>
            <input
              type="radio"
              name="question"
              value={opt.value}
              checked={selected === opt.value}
              onChange={() => onSelect(opt.value)}
              className={styles.radio}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
