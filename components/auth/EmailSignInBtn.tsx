import styles from './GoogleBtn.module.scss';

export default function EmailSignInBtn(props: any) {
  return (
    <div className='w-full'>
      <button className={styles.gsiMaterialButton} onClick={props.chooseEmailSignIn}>
        <div className={styles.gsiMaterialButtonState}></div>
          <div className={styles.gsiMaterialButtonContentWrapper}>
          <span className={styles.gsiMaterialButtonContents}>Sign in with Email</span>
        </div>
      </button>
    </div>
  );
}
