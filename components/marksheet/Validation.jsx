import * as yup from "yup";

const checkoutSchema = yup.object().shape({
  session: yup.string().required("Session is Required"),
  student: yup.mixed().required("Student is Required"),
  term: yup.string().required("Term is Required"),
  result: yup.string().required("Overall Result is Required"),
});

export default checkoutSchema;
