import { useEffect, useRef, useState } from 'react';
import '../styles/Send.css';
import stamp from '../img/stamp.png';

function Modal_send({ setModalOpen }) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handler = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setModalOpen(false);
            }
        };

        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler); // 모바일

        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler); // 모바일
        };
    }, [modalRef.current, setModalOpen]);


    const [currentUrl, setCurrentUrl] = useState('');
    useEffect(() => {
        const url = window.location.href;
        setCurrentUrl(url);
        return () => {
        };
    }, []);

    const isBeforeChristmas = () => {
        const currentDate = new Date();
        const christmasDate = new Date(currentDate.getFullYear(), 11, 25); // 11은 12월을 나타냅니다 (0부터 시작)
        return currentDate < christmasDate;
    };

    const calculateDaysLeft = () => {
        const currentDate = new Date();
        const christmasDate = new Date(currentDate.getFullYear(), 11, 25); // 11은 12월을 나타냅니다 (0부터 시작)
        const timeDifference = christmasDate - currentDate;
        const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        return daysLeft;
    };

    const getMessage = () => {
        if (isBeforeChristmas()) {
            const daysLeft = calculateDaysLeft();
            return (
                <>
                    <div className='stamp'><img src={stamp} alt="스탬프" /></div>
                    <div className='send-modal-message'>
                        <p>12월 25일에 보낼 수 있어요!</p>
                        <p>크리스마스를 기다리며 트리를 꾸며주세요!</p>
                    </div>
                    <div className='link-area'><p style={{width:"85px", margin: "0 auto",}}>{daysLeft}일 남았어요.</p></div>
                </>
            );
        } else {
            // 12월 25일 이후에 보여질 메시지
            return (
                <>
                    <div className='stamp'><img src={stamp} alt="스탬프" /></div>
                    <div className='send-modal-message'>
                        <p>트리가 완성되었어요!</p>
                        <p>이제 트리를 보내주세요!</p>
                    </div>
                    <div className='link-area'><p>{currentUrl}</p><div className='copy-btn' onClick={handleCopy} style={{cursor: "pointer",}}>복사</div></div>
                </>
            );
        }
    };


    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
        console.log('URL이 클립보드에 복사되었습니다.');
        } catch (err) {
            console.error('클립보드 복사 실패:', err);
        }
    };

    return (
        <div className="send-modal-container">
            <div className='send-modal' ref={modalRef}>
                {getMessage()}
            </div>
        </div>
    );
}

export default Modal_send;