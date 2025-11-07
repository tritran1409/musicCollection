import { useEffect } from "react";

/**
 * Hook để detect click ngoài element
 * @param {React.RefObject} ref - ref của element cần detect
 * @param {Function} callback - hàm sẽ gọi khi click ngoài
 */
export default function useOutsideClick(ref, callback) {
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, callback]);
}
