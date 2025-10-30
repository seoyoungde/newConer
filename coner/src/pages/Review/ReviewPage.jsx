import React, { useState, useRef } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../lib/firebase";
import Button from "../../components/ui/Button";
import { FaTimes } from "react-icons/fa";
import Modal from "../../components/common/Modal/Modal";
import { IoMdStar } from "react-icons/io";

// 상수들
const MAX_RATING = 5;
const MAX_PHOTOS = 10;
const STAR_SIZE = 30;
const STAR_COLOR = "#004FFF";
const MAX_TEXT_LENGTH = 100;

const ReviewPage = () => {
  const [ratings, setRatings] = useState({
    partner: 0,
    service: 0,
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [serviceOpinion, setServiceOpinion] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const { requestId } = useParams(); // URL에서 의뢰서 ID 가져오기
  const navigate = useNavigate();

  const [popupMessage, setPopupMessage] = useState("");

  // 사진을 Firebase Storage에 업로드하고 URL 반환
  const uploadPhotosToStorage = async (photos) => {
    const uploadPromises = photos.map(async (photo, index) => {
      const fileName = `reviews/${requestId}/photo_${Date.now()}_${index}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, photo.file);
      return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  };

  // 도움이필요해요 링크
  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat", "_blank");
  };

  //날짜 형식변환
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}년 ${m}월 ${d}일`;
  };

  // 리뷰 제출 함수
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!requestId) {
      setPopupMessage("의뢰서가 없습니다.");
      return;
    }

    if (ratings.partner === 0 || ratings.service === 0) {
      setPopupMessage("평점을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 사진들을 Firebase Storage에 업로드
      let photoUrls = [];
      if (uploadedPhotos.length > 0) {
        photoUrls = await uploadPhotosToStorage(uploadedPhotos);
      }

      // Firestore에 저장할 데이터 구성
      const reviewData = {
        partner_rating: ratings.partner.toString(),
        photo: photoUrls,
        serviceOpinion: serviceOpinion,
        service_rating: ratings.service.toString(),
        createdAt: formatDate(new Date()),
      };

      // Firestore의 Review 컬렉션에 저장 (문서 ID는 requestId)
      await setDoc(doc(db, "Review", requestId), reviewData);

      setPopupMessage("감사합니다. 소중한 후기가 등록되었습니다");
    } catch (error) {
      alert("리뷰 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (popupMessage.includes("감사합니다")) {
      navigate("/");
    } else {
      setPopupMessage("");
    }
  };

  const handlePhotoButtonClick = () => {
    if (uploadedPhotos.length < MAX_PHOTOS) {
      fileInputRef.current?.click();
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // 현재 업로드된 사진 수와 새로 선택한 파일 수를 합쳐서 최대 개수 확인
    const remainingSlots = MAX_PHOTOS - uploadedPhotos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // 파일을 미리보기용 URL로 변환
    const newPhotos = filesToAdd.map((file, index) => ({
      id: Date.now() + index,
      file: file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);

    // input 값 초기화 (같은 파일을 다시 선택할 수 있도록)
    event.target.value = "";
  };

  // 사진 삭제 함수
  const removePhoto = (photoId) => {
    setUploadedPhotos((prev) => {
      const photoToRemove = prev.find((photo) => photo.id === photoId);
      if (photoToRemove) {
        // 메모리 누수 방지를 위해 URL 해제
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((photo) => photo.id !== photoId);
    });
  };

  // 평점 업데이트 함수
  const updateRating = (type, value) => {
    setRatings((prev) => ({ ...prev, [type]: value }));
  };

  // 별점 컴포넌트
  const StarRating = ({ rating, onRatingChange, label }) => (
    <RatingSection>
      <RatingLabel>{label}</RatingLabel>
      <StarContainer>
        {Array.from({ length: MAX_RATING }, (_, index) => {
          const starValue = index + 1;
          return (
            <StarButton
              key={starValue}
              onClick={() => onRatingChange(starValue)}
              aria-label={`${starValue}점`}
            >
              {starValue <= rating ? (
                <IoMdStar size={STAR_SIZE} color={STAR_COLOR} />
              ) : (
                <IoMdStar size={STAR_SIZE} color="#E2E4E9" />
              )}
            </StarButton>
          );
        })}
      </StarContainer>
    </RatingSection>
  );

  return (
    <Container>
      <PageHeader>
        <HeaderTitle>코너 서비스를 이용하신 후기</HeaderTitle>
      </PageHeader>

      <ReviewForm onSubmit={handleSubmitReview}>
        <RatingsContainer>
          <StarRating
            rating={ratings.partner}
            onRatingChange={(value) => updateRating("partner", value)}
            label="기사님은 어떠셨나요?"
          />
        </RatingsContainer>
        <RatingsContainer>
          <StarRating
            rating={ratings.service}
            onRatingChange={(value) => updateRating("service", value)}
            label="서비스는 어떠셨나요?"
          />
        </RatingsContainer>
        <TextAreaWrapper>
          <TextAreaLabel>서비스에 대한 의견을 나눠주세요</TextAreaLabel>
          <Divider />
          <StyledTextArea
            placeholder="나눠주신 의견을 통해 더 나은 서비스를 제공하는 코너가 되겠습니다."
            rows={4}
            value={serviceOpinion}
            onChange={(e) => setServiceOpinion(e.target.value)}
          />
          <CharacterCount>
            {serviceOpinion.length} | {MAX_TEXT_LENGTH}자 이내
          </CharacterCount>
        </TextAreaWrapper>

        <PhotoUploadSection>
          <PhotoUploadHeader>
            <PhotoUploadTitle>사진을 추가하시겠습니까?</PhotoUploadTitle>
            <PhotoUploadSubtitle>최대 10장</PhotoUploadSubtitle>
          </PhotoUploadHeader>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            multiple
            onChange={handleFileUpload}
          />

          <PhotoUploadButton
            onClick={handlePhotoButtonClick}
            disabled={uploadedPhotos.length >= MAX_PHOTOS}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M0 7.99609H16" stroke="#8D989F" strokeWidth="2" />
              <path
                d="M8.00293 0L8.00293 16"
                stroke="#8D989F"
                strokeWidth="2"
              />
            </svg>
          </PhotoUploadButton>

          {/* 업로드된 사진들 미리보기 */}
          {uploadedPhotos.length > 0 && (
            <PhotoPreviewContainer>
              {uploadedPhotos.map((photo) => (
                <PhotoPreviewItem key={photo.id}>
                  <PhotoPreview src={photo.preview} alt={photo.name} />
                  <RemoveButton
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <FaTimes size={12} />
                  </RemoveButton>
                </PhotoPreviewItem>
              ))}
            </PhotoPreviewContainer>
          )}
        </PhotoUploadSection>

        <ButtonArea>
          <Button
            fullWidth
            size="stepsize"
            type="submit"
            disabled={
              isSubmitting || ratings.partner === 0 || ratings.service === 0
            }
          >
            {isSubmitting ? "저장 중..." : "후기 작성 완료"}
          </Button>
          <CSButtonContainer>
            <CSButton onClick={handleHelpClick}>
              <CSButtonText>도움이 필요해요</CSButtonText>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
              >
                <path d="M0.999999 13L7 7L1 1" stroke="#A0A0A0" />
              </svg>
            </CSButton>
          </CSButtonContainer>
        </ButtonArea>
      </ReviewForm>
      <Modal
        open={!!popupMessage}
        onClose={handleModalClose}
        width={320}
        containerId="rightbox-modal-root"
      >
        {popupMessage}
      </Modal>
    </Container>
  );
};

export default ReviewPage;

const Container = styled.section`
  width: 100%;
`;

const PageHeader = styled.header`
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.15);
  height: 72px;
  flex-shrink: 0;
  align-items: center;
`;
const HeaderTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h3};
  line-height: ${({ theme }) => theme.font.lineHeight.h3};
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const ReviewForm = styled.form`
  width: 100%;
  padding: 36px 24px 24px 24px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
`;

const RatingsContainer = styled.div`
  background-color: white;
  margin-bottom: 16px;
  border-radius: 10px;
  padding: 23px 26px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 16px 19px;
  }
`;

const RatingSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    flex-direction: column;
    gap: 9px;
  }
`;

const RatingLabel = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
`;

const StarContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 7px;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
  }

  &:focus {
    outline: 2px solid ${STAR_COLOR};
    border-radius: 4px;
  }
`;

const TextAreaWrapper = styled.div`
  background-color: white;
  padding: 23px 26px;
  border-radius: 10px;
  margin-bottom: 16px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 16px 19px;
  }
`;

const TextAreaLabel = styled.label`
  display: block;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #a2afb7;
  margin-bottom: 16px;
`;
const StyledTextArea = styled.textarea`
  width: 100%;
  border: none;
  background: white;
  color: #333;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  min-height: 100px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #8d989f;
  }
`;
const CharacterCount = styled.div`
  text-align: right;
  font-size: 14px;
  color: #8d989f;
  margin-top: 8px;
`;

const PhotoUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 10px;
  padding: 23px 26px;
  margin-bottom: 16px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 16px 19px;
  }
`;
const PhotoUploadHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
`;
const PhotoUploadTitle = styled.p`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
`;
const PhotoUploadSubtitle = styled.p`
  font-size: 14px;
  color: #8d989f;
  margin: 0;
`;
const PhotoUploadButton = styled.div`
  border-radius: 4px;
  width: 96px;
  height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.2s ease;
  gap: 8px;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  background: #e2e4e9;

  &:hover {
    background-color: ${(props) =>
      props.disabled ? "transparent" : "#f5f5f5"};
  }
`;

const PhotoPreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

const PhotoPreviewItem = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const PhotoPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const ButtonArea = styled.div`
  margin-top: 64px;
`;
const CSButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;
const CSButton = styled.button`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
`;
const CSButtonText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  color: #a0a0a0;
`;
