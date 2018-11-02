// Логика работы видеонаблюдения
const initCamObserv = () => {
  // Инициализация видеонаблюдения
  let activeVideoBrightness = 100;
  let activeVideoContrast = 100;

  // Очистка изменения яркости и контрастности
  const onup = () => {
    document.removeEventListener("pointermove", setBrightness);
    document.removeEventListener("pointermove", setContrast);
  };
  // Позиционирования видео
  const toPos = (cam: HTMLVideoElement, x?: number, y?: number): void => {
    if (x === undefined) x = cam.getBoundingClientRect().left;
    if (y === undefined) y = cam.getBoundingClientRect().top;
    cam.style.top = -y + "px";
    cam.style.left = -x + "px";
  };
  // Увеличение и свертывание видео
  function zoom(ev: PointerEvent) {
    const bg: HTMLElement = <HTMLElement>document.querySelector("html");

    const controls: HTMLElement = <HTMLElement>(
      document.querySelector(".video-controls")
    );
    const cam: HTMLVideoElement = <HTMLVideoElement>ev.target;
    if (cam.parentNode) {
      const analyserPar: HTMLElement = <HTMLElement>cam.parentNode;
      const analyser: HTMLElement = <HTMLElement>(
        analyserPar.querySelector(".analyser")
      );
      // Если мы кликнули по активному видео
      if (cam.classList.contains("video_active")) {
        controls.classList.remove("video-controls_active");
        analyser.classList.remove("analyser_active");
        cam.style.width = "100%";
        cam.style.height = "300px";
        toPos(cam, 0, 0);
        setTimeout(() => {
          cam.classList.remove("video_active");

          bg.style.overflow = "scroll";
        }, 500);
      } else {
        // выставляем положение регуляторов соответственно уровням настроек на видео
        if (cam.style.filter === "") {
          setControls("100", "100");
        } else if (cam.style.filter) {
          const filterVal: string = cam.style.filter;
          const regBr = /brightness\(([^)]+)%\)/;
          const regCn = /contrast\(([^)]+)%\)/;
          let bra: RegExpExecArray | null;
          let cnn: RegExpExecArray | null;
          bra = regBr.exec(filterVal);
          cnn = regCn.exec(filterVal);
          if (bra && cnn) setControls(bra[1], cnn[1]);
        }

        bg.style.overflow = "hidden";
        controls.classList.add("video-controls_active");
        cam.classList.add("video_active");
        analyser.classList.add("analyser_active");
        cam.style.width = window.innerWidth + "px";
        cam.style.height = window.innerHeight + "px";
        toPos(cam);
      }
    }
  }
  // Установка CSS - фильтров
  const setFilter = (): void => {
    const activeVideo: HTMLVideoElement = <HTMLVideoElement>(
      document.querySelector(".video_active")
    );
    activeVideo.style.filter =
      "brightness(" +
      activeVideoBrightness +
      "%) contrast(" +
      activeVideoContrast +
      "%)";
  };
  const setControls = (b: string, c: string): void => {
    const brInput: HTMLInputElement = <HTMLInputElement>(
      document.querySelector(".video-control_brightness")
    );
    const conInput: HTMLInputElement = <HTMLInputElement>(
      document.querySelector(".video-control_contrast")
    );
    brInput.value = b;
    conInput.value = c;
  };
  // Установка яркости
  const setBrightness = (ev: PointerEvent): void => {
    const br: HTMLInputElement = <HTMLInputElement>ev.target;
    activeVideoBrightness = parseInt(br.value, 10);
    setFilter();
  };
  // Установка контрастности
  const setContrast = (ev: PointerEvent): void => {
    const cn: HTMLInputElement = <HTMLInputElement>ev.target;
    activeVideoContrast = parseInt(cn.value, 10);
    setFilter();
  };
  // установка яркости и контрастности
  const videoSet = (ev: PointerEvent): void => {
    const control: HTMLInputElement = <HTMLInputElement>ev.target;
    if (control.classList.contains("video-control_brightness"))
      document.addEventListener("pointermove", setBrightness);
    if (control.classList.contains("video-control_contrast"))
      document.addEventListener("pointermove", setContrast);
  };
  // включение и выключение звука
  const toggleVolume = (ev: PointerEvent): void => {
    const mt: HTMLElement = <HTMLElement>ev.target;
    if (mt.dataset.video) {
      const mtId: string = mt.dataset.video;
      const video: HTMLVideoElement = <HTMLVideoElement>(
        document.getElementById(mtId)
      );
      video.muted = !video.muted;
      mt.classList.toggle("video-volume_unmuted");
    }
  };
  // анализатор

  const analyse = (cam: HTMLVideoElement): void => {
    const context: AudioContext = new AudioContext();
    const source = context.createMediaElementSource(cam);
    const analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.1;
    analyser.fftSize = 32;
    const analyserBuffer = analyser.frequencyBinCount;
    const bands: Uint8Array = new Uint8Array(analyserBuffer);
    setInterval(() => {
      analyser.getByteFrequencyData(bands);
      let v = 0;
      v = bands.reduce((a: number, b: number): number => (a > b ? a : b), 0);
      if (cam.parentNode) {
        const analyserPar: HTMLElement = <HTMLElement>cam.parentNode;
        const analyserBlock: HTMLElement = <HTMLElement>(
          analyserPar.querySelector(".analyser")
        );
        analyserBlock.style.height = v + "px";
      }
    }, 100);
    // соединяем аудио-ноды
    source.connect(analyser);
    analyser.connect(context.destination);
  };

  const camsMas = document.getElementsByClassName("video");
  const cams: Element[] = Array.prototype.slice.call(camsMas);

  cams.forEach(
    (cam: Element): void => {
      cam.addEventListener("pointerdown", x => {
        zoom(<PointerEvent>x);
      });
      analyse(<HTMLVideoElement>cam);
    }
  );

  const controlInputs: Element[] = [
    ...document.getElementsByClassName("video-control")
  ];
  controlInputs.forEach((control: Element) => {
    control.addEventListener("pointerdown", x => {
      videoSet(<PointerEvent>x);
    });
  });
  const volumeControls: Element[] = [
    ...document.getElementsByClassName("video-volume")
  ];
  volumeControls.forEach((control: Element) => {
    control.addEventListener("pointerdown", x => {
      toggleVolume(<PointerEvent>x);
    });
  });
  document.addEventListener("pointerup", onup);
};
initCamObserv();