import { utils, write } from "xlsx-js-style";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import * as RNFS from "react-native-fs";
import Share from "react-native-share";
import database from "@react-native-firebase/database";
import { Language } from "../../types/language";
import XLSX from "xlsx-js-style";

// Definición de tipos

interface BatchOperation {
  [path: string]: any;
}

interface ExcelUserRow {
  "ID Usuario": string;
  Tipo: string;
  Nombre: string;
  Email: string;
  "Código de Clase": string;
  "Fecha de Registro": string;
  "Último Acceso": string;
  País: string;
  Idioma: string;
  Bandera: string;
  Edad: string;
  "Fecha de Nacimiento": string;
}

interface ExcelResponseRow {
  "ID Usuario": string;
  "Tipo Usuario": string;
  "Tipo Formulario": string;
  País: string;
  "Código de Clase": string;
  "Fecha de Respuesta": string;
  "Hora de Respuesta": string;
  "Idioma del Formulario": string;
  "Es Invitado": string;
  [key: string]: string; // Para las preguntas dinámicas
}

interface ClassCode {
  active: boolean;
  code: string;
  description: string;
  teacherId: string;
  teacherName: string;
  createdAt: number;
}

interface CountryRole {
  country: string;
  language: string;
  flag: string;
}

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: "student" | "guest";
  classCode: string | null;
  createdAt: number;
  lastLogin: number;
  age: number | null;
  dateOfBirth: string | null;
  countryRole?: {
    country: string;
    language: string;
    flag: string;
  };
}

interface ResponseData {
  answers: number[];
  completedAt: number;
  language: string;
  isGuest: boolean;
  country: string | null;
  userId?: string;
}

interface ClassDetails {
  active: boolean;
  code: string;
  description: string;
  teacherId: string;
  teacherName: string;
}

interface DatabaseUser {
  age?: number;
  classCode?: string | undefined; // Añadido undefined explícitamente
  countryRole?: CountryRole;
  createdAt: number;
  dateOfBirth?: string | undefined; // Añadido undefined explícitamente
  email: string;
  lastLogin: number;
  name: string;
  role: string;
  uid: string;
}

interface DatabaseGuestUser extends DatabaseUser {
  role: "guest";
  classDetails?: ClassDetails;
}

interface DatabaseStudentUser extends DatabaseUser {
  role: "student";
}

interface DatabaseResponse {
  answers: number[];
  completedAt: number;
  country?: string;
  language: Language;
  isGuest?: boolean;
  userId?: string;
}

interface ResponsesStructure {
  [userId: string]: {
    [formType: string]: DatabaseResponse;
  };
}

// Helper function to validate language with all supported options
const validateLanguage = (lang: string): Language => {
  const validLanguages: Language[] = ["es", "en", "pt-PT", "pt-BR"];
  const normalizedLang = lang?.trim().toLowerCase();

  // Check for exact matches first
  if (normalizedLang === "es" || normalizedLang === "en") {
    return normalizedLang;
  }

  // Check for Portuguese variants
  if (
    normalizedLang === "pt-pt" ||
    normalizedLang === "portugués" ||
    normalizedLang === "portugues"
  ) {
    return "pt-PT";
  }

  if (
    normalizedLang === "pt-br" ||
    normalizedLang === "português brasileiro" ||
    normalizedLang === "portugues brasileiro"
  ) {
    return "pt-BR";
  }

  // Default to Spanish if no match is found
  return "es";
};

export class ExcelDataHandler {
  private static dbInstance: any = null;

  private static getDatabase() {
    try {
      if (!this.dbInstance) {
        this.dbInstance = database();
        // Verificar la conexión inmediatamente
        this.dbInstance
          .ref(".info/connected")
          .once("value")
          .catch((error: any) => {
            console.error("Error de conexión Firebase:", error);
            this.dbInstance = null;
          });
      }
      return this.dbInstance;
    } catch (error) {
      console.error("Error inicializando Firebase:", error);
      return null;
    }
  }

  private static isStudentUser(
    user: DatabaseUser
  ): user is DatabaseStudentUser {
    return user?.role === "student";
  }

  private static async getStoragePermission(): Promise<boolean> {
    if (Platform.OS === "ios") return true;

    try {
      const androidVersion =
        Platform.OS === "android"
          ? parseInt(Platform.Version.toString(), 10)
          : 0;

      if (androidVersion >= 33) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        return Object.values(granted).some(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const writePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Permiso de almacenamiento",
            message:
              "La aplicación necesita acceso al almacenamiento para guardar archivos Excel.",
            buttonNeutral: "Preguntar luego",
            buttonNegative: "Cancelar",
            buttonPositive: "OK",
          }
        );
        return writePermission === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error("Error en permisos:", err);
      return false;
    }
  }

  private static formatAnswers(answers?: number[]): Record<string, number> {
    if (!answers || !Array.isArray(answers)) return {};
    return answers.reduce(
      (acc, answer, index) => ({
        ...acc,
        [`Pregunta ${index + 1}`]: answer,
      }),
      {}
    );
  }

  private static getClassCode(user: DatabaseUser | null): string {
    if (!user) return "-";
    return user.classCode || "-";
  }

  private static getFilePath(fileName: string): string {
    if (Platform.OS === "ios") {
      return `${RNFS.DocumentDirectoryPath}/${fileName}`;
    }
    return `${RNFS.CachesDirectoryPath}/${fileName}`;
  }

  private static async verifyTeacherAccess(): Promise<boolean> {
    try {
      const currentUser = database().app.auth().currentUser;
      if (!currentUser) {
        return false;
      }

      const userSnapshot = await database()
        .ref(`/users/${currentUser.uid}`)
        .once("value");

      const userData = userSnapshot.val();
      const hasAccess = userData?.role === "teacher";


      return hasAccess;
    } catch (error) {
      console.error("Error verificando acceso de profesor:", error);
      return false;
    }
  }

  // Añadir el método findClassDetails que falta
  private static async findClassDetails(
    classCode: string,
    existingClassCodes: Record<string, ClassCode>
  ): Promise<ClassDetails | null> {
    const classCodeEntry = Object.entries(existingClassCodes).find(
      ([_, data]) => data.code === classCode
    );

    if (classCodeEntry) {
      const [_, classData] = classCodeEntry;
      return {
        active: classData.active,
        code: classData.code,
        description: classData.description,
        teacherId: classData.teacherId,
        teacherName: classData.teacherName,
      };
    }

    return null;
  }

  static async importData(fileUri: string): Promise<void> {
    try {
      // Verificación de permisos...
      const isTeacher = await this.verifyTeacherAccess();
      if (!isTeacher) {
        throw new Error(
          "No tienes permisos para importar datos. Se requiere rol de profesor."
        );
      }

      const content = await RNFS.readFile(fileUri, "base64");
      const workbook = XLSX.read(content, { type: "base64" });


      const classCodesSnapshot = await database()
        .ref("/classCodes")
        .once("value");
      const existingClassCodes = classCodesSnapshot.val() || {};

      // Procesar hoja de Usuarios
      if (workbook.Sheets["Usuarios"]) {
        const users = XLSX.utils.sheet_to_json<ExcelUserRow>(
          workbook.Sheets["Usuarios"],
          {
            raw: false,
            defval: "-",
          }
        );

        const cleanUsers = users.filter(
          (user) => user["ID Usuario"] && user["ID Usuario"] !== "ID Usuario"
        );


        // Procesar usuarios en lotes
        for (const user of cleanUsers) {
          try {
            const isGuest = user["Tipo"].toLowerCase() === "invitado";
            const path = isGuest ? "guests" : "users";
            const classCode =
              user["Código de Clase"] === "-"
                ? undefined
                : user["Código de Clase"].trim();

            // Base user data
            const userData: DatabaseUser = {
              uid: user["ID Usuario"].toString().trim(),
              name: user["Nombre"]?.trim() || user["ID Usuario"],
              email: user["Email"]?.trim() || `${user["ID Usuario"]}@guest.com`,
              role: isGuest ? "guest" : "student",
              classCode: classCode,
              createdAt: this.parseDate(user["Fecha de Registro"]),
              lastLogin: this.parseDate(user["Último Acceso"]),
              age: user["Edad"] === "-" ? 0 : parseInt(user["Edad"]),
              dateOfBirth: this.formatDate(user["Fecha de Nacimiento"]),
            };

            // Add countryRole if available
            if (user["País"] !== "-" && user["Idioma"] !== "-") {
              userData.countryRole = {
                country: user["País"].trim(),
                language: validateLanguage(user["Idioma"]),
                flag:
                  user["Bandera"] === "-"
                    ? this.getFlagFromCountry(user["País"].trim())
                    : user["Bandera"].trim(),
              };
            }

            // Add classDetails for guests
            if (isGuest && classCode) {
              const classDetails = await this.findClassDetails(
                classCode,
                existingClassCodes
              );
              if (classDetails) {
                (userData as DatabaseGuestUser).classDetails = classDetails;
              }
            }

            await database().ref(`/${path}/${userData.uid}`).set(userData);
          } catch (error) {
            console.error(
              `Error procesando usuario ${user["ID Usuario"]}:`,
              error
            );
          }
        }
      }

      // Procesar hoja de Respuestas
      if (workbook.Sheets["Respuestas"]) {
        const responses = XLSX.utils.sheet_to_json<ExcelResponseRow>(
          workbook.Sheets["Respuestas"],
          {
            raw: false,
            defval: "-",
          }
        );

        const cleanResponses = responses.filter(
          (response) =>
            response["ID Usuario"] && response["ID Usuario"] !== "ID Usuario"
        );


        for (const response of cleanResponses) {
          try {
            const answersArray: number[] = [];
            for (let i = 1; i <= 6; i++) {
              const answer = response[`Pregunta ${i}`];
              if (answer !== "-" && answer !== undefined) {
                const numAnswer = parseInt(answer.toString());
                if (!isNaN(numAnswer)) {
                  answersArray.push(numAnswer);
                }
              }
            }

            if (answersArray.length > 0) {
              const responseData: DatabaseResponse = {
                answers: answersArray,
                completedAt: this.parseDateTime(
                  response["Fecha de Respuesta"],
                  response["Hora de Respuesta"]
                ),
                language: validateLanguage(response["Idioma del Formulario"]),
                isGuest: response["Es Invitado"]?.toLowerCase() === "sí",
                country:
                  response["País"] !== "-"
                    ? response["País"].trim()
                    : undefined,
                userId: response["ID Usuario"].toString().trim(),
              };

              await database()
                .ref(
                  `/form_responses/${responseData.userId}/${response["Tipo Formulario"]}`
                )
                .set(responseData);
            }
          } catch (error) {
            console.error(
              `Error procesando respuesta ${response["ID Usuario"]}:`,
              error
            );
          }
        }
      }

      Alert.alert("Éxito", "Datos importados correctamente");
    } catch (error) {
      console.error("Error detallado al importar:", error);
      Alert.alert(
        "Error",
        "Error al importar los datos: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  // Helper methods
  private static parseDate(dateStr: string): number {
    try {
      if (dateStr === "-") return Date.now();
      const [day, month, year] = dateStr.split("/");
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      ).getTime();
    } catch {
      return Date.now();
    }
  }

  private static parseDateTime(date: string, time: string): number {
    try {
      if (date === "-") return Date.now();
      const [day, month, year] = date.split("/");
      const dateTimeStr = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}T${time || "00:00:00"}`;
      return new Date(dateTimeStr).getTime();
    } catch {
      return Date.now();
    }
  }

  private static formatDate(dateStr: string): string | undefined {
    if (!dateStr || dateStr === "-") return undefined;
    if (dateStr.includes("-")) return dateStr; // Ya está en formato YYYY-MM-DD
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  private static getFlagFromCountry(country: string): string {
    const countryFlags: Record<string, string> = {
      España: "spain",
      "United States": "usa",
      Brasil: "brazil",
      Portugal: "portugal",
    };
    return countryFlags[country] || "";
  }

  private static formatUserData(user: DatabaseUser | null, userId: string) {
    const isGuest = user?.role === "guest";

    return {
      "ID Usuario": userId,
      Tipo: isGuest ? "Invitado" : "Estudiante",
      Nombre: user?.name || userId,
      Email: user?.email || "-",
      "Código de Clase": this.getClassCode(user),
      "Fecha de Registro": user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "-",
      "Último Acceso": user?.lastLogin
        ? new Date(user.lastLogin).toLocaleDateString()
        : "-",
      País: user?.countryRole?.country || "-",
      Idioma: user?.countryRole?.language || "-",
      Bandera: user?.countryRole?.flag || "-",
      Edad: user?.age || "-",
      "Fecha de Nacimiento": user?.dateOfBirth || "-",
    };
  }

  private static getHeaderStyle() {
    return {
      fill: {
        patternType: "solid",
        fgColor: { rgb: "673AB7" },
      },
      font: {
        name: "Arial",
        color: { rgb: "FFFFFF" },
        bold: true,
        sz: 12,
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },
      border: {
        top: { style: "thin", color: { rgb: "5829A7" } },
        bottom: { style: "thin", color: { rgb: "5829A7" } },
        left: { style: "thin", color: { rgb: "5829A7" } },
        right: { style: "thin", color: { rgb: "5829A7" } },
      },
    };
  }

  private static getDataStyle(isAlternate: boolean, isNumeric = false) {
    return {
      fill: {
        patternType: "solid",
        fgColor: { rgb: isAlternate ? "F3E5F5" : "FFFFFF" },
      },
      font: {
        name: "Arial",
        sz: 11,
        color: { rgb: "333333" },
      },
      alignment: {
        vertical: "center",
        horizontal: isNumeric ? "center" : "left",
        wrapText: true,
      },
      border: {
        top: { style: "thin", color: { rgb: "E1BEE7" } },
        bottom: { style: "thin", color: { rgb: "E1BEE7" } },
        left: { style: "thin", color: { rgb: "E1BEE7" } },
        right: { style: "thin", color: { rgb: "E1BEE7" } },
      },
    };
  }

  private static applyTableStyles(ws: any, hasNumericColumns = false) {
    const range = utils.decode_range(ws["!ref"]);
    ws["!rows"] = [{ hpt: 40 }];

    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) {
          ws[cellRef] = {
            v: "",
            s: this.getDataStyle(R % 2 === 1, hasNumericColumns),
          };
          continue;
        }

        if (R === 0) {
          ws[cellRef].s = this.getHeaderStyle();
        } else {
          const isNumericColumn = hasNumericColumns && C >= range.e.c - 5;
          ws[cellRef].s = this.getDataStyle(R % 2 === 1, isNumericColumn);
        }
      }

      if (R > 0) {
        ws["!rows"][R] = { hpt: 25 };
      }
    }

    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      let maxLength = 0;
      for (let R = range.s.r; R <= range.e.r; R++) {
        const cellRef = utils.encode_cell({ r: R, c: C });
        if (ws[cellRef] && ws[cellRef].v) {
          maxLength = Math.max(maxLength, String(ws[cellRef].v).length);
        }
      }
      colWidths[C] = { wch: Math.min(Math.max(maxLength * 1.2, 10), 30) };
    }
    ws["!cols"] = colWidths;
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  }

  static async exportData(): Promise<void> {
    let filePath = "";
    try {
      const hasPermission = await ExcelDataHandler.getStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          "Error",
          "Se requieren permisos de almacenamiento para exportar"
        );
        return;
      }

      const [usersSnapshot, guestsSnapshot, responsesSnapshot] =
        await Promise.all([
          database().ref("/users").once("value"),
          database().ref("/guests").once("value"),
          database().ref("/form_responses").once("value"),
        ]);

      const users = usersSnapshot.val() as Record<string, DatabaseUser>;
      const guests = guestsSnapshot.val() as Record<string, DatabaseGuestUser>;
      const responses = responsesSnapshot.val() as ResponsesStructure;

      const wb = utils.book_new();

      // Hoja de Usuarios
      const studentUsers = Object.entries(users || {})
        .filter(([_, user]) => ExcelDataHandler.isStudentUser(user))
        .map(([id, user]) => ExcelDataHandler.formatUserData(user, id));

      const guestUsers = Object.entries(guests || {}).map(([id, guest]) =>
        ExcelDataHandler.formatUserData(guest, id)
      );

      const wsUsers = utils.json_to_sheet([...studentUsers, ...guestUsers], {
        header: [
          "ID Usuario",
          "Tipo",
          "Nombre",
          "Email",
          "Código de Clase",
          "Fecha de Registro",
          "Último Acceso",
          "País",
          "Idioma",
          "Bandera",
          "Edad",
          "Fecha de Nacimiento",
        ],
      });
      ExcelDataHandler.applyTableStyles(wsUsers, false);
      utils.book_append_sheet(wb, wsUsers, "Usuarios");

      // Hoja de Respuestas
      const responsesData = Object.entries(responses || {}).flatMap(
        ([userId, formTypes]) =>
          Object.entries(formTypes).map(([formType, response]) => {
            const typedResponse = response as DatabaseResponse;
            const user = users?.[userId] || guests?.[userId];
            const isGuest = userId.startsWith("guest_");

            return {
              "ID Usuario": userId,
              Nombre: user?.name || userId,
              "Tipo Usuario": isGuest ? "Invitado" : "Estudiante",
              "Tipo Formulario": formType,
              País: user?.countryRole?.country || typedResponse.country || "-",
              "Código de Clase": ExcelDataHandler.getClassCode(user),
              "Fecha de Respuesta": new Date(
                typedResponse.completedAt
              ).toLocaleDateString(),
              "Hora de Respuesta": new Date(
                typedResponse.completedAt
              ).toLocaleTimeString(),
              "Idioma del Formulario": typedResponse.language,
              "Es Invitado": isGuest ? "Sí" : "No",
              ...ExcelDataHandler.formatAnswers(typedResponse.answers),
            };
          })
      );

      const wsResponses = utils.json_to_sheet(responsesData);
      ExcelDataHandler.applyTableStyles(wsResponses, true);
      utils.book_append_sheet(wb, wsResponses, "Respuestas");

      wb.Workbook = { Views: [{ RTL: false }] };

      const fileName = `datos_formularios_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      filePath = ExcelDataHandler.getFilePath(fileName);


      const wbout = write(wb, {
        type: "binary",
        bookType: "xlsx",
        cellStyles: true,
        compression: true,
      });

      await RNFS.writeFile(filePath, wbout, "ascii");

      // Preparar y compartir el archivo
      const base64Data = await RNFS.readFile(filePath, "base64");

      const shareOptions = {
        title: "Guardar archivo Excel",
        message: "Datos exportados",
        url: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: fileName,
        saveToFiles: true,
      };

      try {
        await Share.open(shareOptions);
        Alert.alert("Éxito", "Los datos han sido exportados correctamente");
      } catch (shareError) {
        // Solo mostrar error si no es una cancelación de compartir
        if (
          shareError instanceof Error &&
          shareError.message !== "User did not share" &&
          !shareError.message.includes("User canceled")
        ) {
          throw shareError;
        }
      }
    } catch (error) {
      console.error("Error en exportación:", error);
      Alert.alert(
        "Error",
        "No se pudo exportar el archivo. Error: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      // Limpiar el archivo temporal si existe
      if (filePath) {
        try {
          const exists = await RNFS.exists(filePath);
          if (exists) {
            await RNFS.unlink(filePath);
          }
        } catch (cleanupError) {
          console.error("Error al limpiar archivo temporal:", cleanupError);
        }
      }
    }
  }
}