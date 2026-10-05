import os
import numpy as np
import onnx
from onnx import helper, TensorProto

def create_tracex_onnx_model(output_path: str):
    # Weights for the 12 features
    # [url_length, hostname_length, path_length, shannon_entropy, subdomain_count,
    #  has_ip_address, is_punycode, symbol_count_at, symbol_count_hyphen,
    #  suspicious_keyword_flag, tld_risk_weight, digit_to_letter_ratio]
    weights = np.array([
        0.001,  # 0: url_length (dampened so long queries do not false-positive)
        0.025,  # 1: hostname_length
        0.005,  # 2: path_length
        0.150,  # 3: shannon_entropy (calibrated)
        0.400,  # 4: subdomain_count
        3.000,  # 5: has_ip_address (binary)
        3.200,  # 6: is_punycode (binary)
        2.500,  # 7: symbol_count_at
        0.500,  # 8: symbol_count_hyphen
        1.400,  # 9: suspicious_keyword_flag (binary)
        2.200,  # 10: tld_risk_weight
        0.700   # 11: digit_to_letter_ratio
    ], dtype=np.float32).reshape(12, 1)

    bias = np.array([-3.50], dtype=np.float32)

    # Define Input & Output tensors
    input_tensor = helper.make_tensor_value_info('features', TensorProto.FLOAT, [1, 12])
    output_tensor = helper.make_tensor_value_info('risk_score', TensorProto.FLOAT, [1, 1])

    # Initializers for weights and bias
    w_initializer = helper.make_tensor(
        name='W',
        data_type=TensorProto.FLOAT,
        dims=[12, 1],
        vals=weights.flatten().tolist()
    )

    b_initializer = helper.make_tensor(
        name='B',
        data_type=TensorProto.FLOAT,
        dims=[1],
        vals=bias.flatten().tolist()
    )

    # Gemm Node: Y = alpha * A * B + beta * C
    gemm_node = helper.make_node(
        'Gemm',
        inputs=['features', 'W', 'B'],
        outputs=['gemm_out'],
        alpha=1.0,
        beta=1.0,
        transA=0,
        transB=0
    )

    # Sigmoid Node: output = 1 / (1 + exp(-x))
    sigmoid_node = helper.make_node(
        'Sigmoid',
        inputs=['gemm_out'],
        outputs=['risk_score']
    )

    # Construct Graph
    graph = helper.make_graph(
        nodes=[gemm_node, sigmoid_node],
        name='TraceXPhishingClassifier',
        inputs=[input_tensor],
        outputs=[output_tensor],
        initializer=[w_initializer, b_initializer]
    )

    # Construct Model with IR version 8 for compatibility with onnxruntime 1.18.0
    model = helper.make_model(
        graph,
        producer_name='TraceXMLForge',
        opset_imports=[helper.make_opsetid('', 13)],
        ir_version=8
    )

    onnx.checker.check_model(model)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    onnx.save(model, output_path)
    print(f"Successfully exported ONNX model to {output_path}")

    # Sanity check calculation
    # Sample benign URL features (e.g. google.com: length 18, host 10, path 0, entropy 2.8, sub 0, ip 0, puny 0, @ 0, - 0, keyw 0, tld 0.05, ratio 0)
    benign_sample = np.array([[18, 10, 0, 2.8, 0, 0, 0, 0, 0, 0, 0.05, 0.0]], dtype=np.float32)
    benign_z = np.dot(benign_sample, weights) + bias
    benign_prob = 1.0 / (1.0 + np.exp(-benign_z))
    print(f"Benign test score (google.com): {benign_prob[0][0]:.4f}")

    # Sample phishing URL features (secure-login.apple-support-verify.com/auth: len 47, host 36, path 5, entropy 4.12, sub 1, ip 0, puny 0, @ 0, - 3, keyw 1, tld 0.05, ratio 0)
    phishing_sample = np.array([[47, 36, 5, 4.12, 1, 0, 0, 0, 3, 1, 0.05, 0.0]], dtype=np.float32)
    phishing_z = np.dot(phishing_sample, weights) + bias
    phishing_prob = 1.0 / (1.0 + np.exp(-phishing_z))
    print(f"Phishing test score (secure-login...): {phishing_prob[0][0]:.4f}")

if __name__ == '__main__':
    target = os.path.abspath('backend/src/main/resources/model/model.onnx')
    create_tracex_onnx_model(target)
